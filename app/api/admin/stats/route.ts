import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/userStore'
import { getAdminSession } from '@/lib/adminAuth'

// 获取用户统计信息（仅管理员）
export async function GET(request: NextRequest) {
  try {
    // 检查管理员认证（使用 cookie）
    const session = await getAdminSession()
    if (!session) {
      // 也支持 Bearer token 方式（兼容旧的认证方式）
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { verifyJwt } = await import('@/lib/auth')
        const jwtUser = await verifyJwt(token)
        const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []
        if (!jwtUser || !ADMIN_EMAILS.includes(jwtUser.email)) {
          return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const users: any[] = []
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 根据存储类型获取所有用户
    const Redis = require('ioredis')
    
    // Redis 存储（优先）
    if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
      try {
        console.log('[Admin Stats] Connecting to Redis...')
        const redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            if (times > 3) return null
            return Math.min(times * 50, 2000)
          },
          lazyConnect: false
        })
        
        // 测试连接
        await redis.ping()
        console.log('[Admin Stats] Redis connected successfully')
        
        // 获取所有用户键
        const keys = await redis.keys('user:*')
        console.log(`[Admin Stats] Found ${keys.length} user keys in Redis`)
        
        // 直接读取每个用户的数据
        for (const key of keys) {
          try {
            const userData = await redis.hgetall(key)
            if (userData && userData.id && userData.email) {
              // 解析用户数据
              const userPlan = (userData.plan || 'free') as any
              users.push({
                id: userData.id,
                name: userData.name || '',
                email: userData.email,
                plan: userPlan,
                emailVerified: userData.emailVerified === 'true' || userData.emailVerified === true,
                createdAt: userData.createdAt || new Date().toISOString(),
                lastLoginAt: userData.lastLoginAt,
                credits: userData.credits ? parseInt(userData.credits, 10) : 0,
                subscriptionExpiresAt: userData.subscriptionExpiresAt,
              })
            }
          } catch (userError) {
            console.error(`[Admin Stats] Error reading user from key ${key}:`, userError)
          }
        }

        await redis.quit()
        console.log(`[Admin Stats] Successfully loaded ${users.length} users from Redis`)
      } catch (error) {
        console.error('[Admin Stats] Redis error:', error)
        console.error('[Admin Stats] Redis error details:', error instanceof Error ? error.message : String(error))
        // Redis 连接失败，继续尝试其他存储方式
      }
    }
    
    // 如果 Redis 没有数据，尝试 Vercel KV 存储
    if (users.length === 0 && process.env.KV_REST_API_URL) {
      try {
        const kv = require('@vercel/kv')
        console.log('[Admin Stats] Using Vercel KV storage')
        // 从用户索引获取所有用户邮箱
        const userIndex = await kv.get('users:index') as string[] | null
        if (userIndex && Array.isArray(userIndex) && userIndex.length > 0) {
          console.log(`[Admin Stats] Found ${userIndex.length} users in KV index`)
          for (const email of userIndex) {
            const user = await getUserByEmail(email)
            if (user) {
              users.push(user)
            }
          }
          console.log(`[Admin Stats] Successfully loaded ${users.length} users from KV`)
        } else {
          console.warn('[Admin Stats] KV storage: User index not found or empty.')
          console.warn('[Admin Stats] This means users were registered before the index feature was added.')
          console.warn('[Admin Stats] Solution: Use /api/admin/rebuild-index endpoint to rebuild the index.')
        }
      } catch (error) {
        console.error('[Admin Stats] KV error:', error)
      }
    }
    // 文件存储（仅用于本地开发，如果Redis和KV都没有数据）
    if (users.length === 0 && !process.env.REDIS_URL && !process.env.KV_REST_API_URL) {
      try {
        console.log('[Admin Stats] Using file storage (local development)')
        const fs = require('fs').promises
        const path = require('path')
        const DATA_DIR = path.join(process.cwd(), 'data')
        const USERS_FILE = path.join(DATA_DIR, 'users.json')
        
        try {
          const raw = await fs.readFile(USERS_FILE, 'utf8')
          const json = JSON.parse(raw || '{"users":[]}')
          users.push(...(json.users || []))
          console.log(`[Admin Stats] Loaded ${users.length} users from file storage`)
        } catch (fileError: any) {
          // 文件不存在或无法读取，继续处理
          if (fileError.code !== 'ENOENT') {
            console.error('[Admin Stats] File storage error:', fileError)
          } else {
            console.log('[Admin Stats] Users file not found (normal for production)')
          }
        }
      } catch (error) {
        console.error('[Admin Stats] File storage error:', error)
      }
    }

    // 记录最终结果
    console.log(`[Admin Stats] Total users loaded: ${users.length}`)
    console.log(`[Admin Stats] Storage type: ${process.env.KV_REST_API_URL ? 'KV' : process.env.REDIS_URL ? 'Redis' : 'File'}`)

    // 计算统计信息
    const stats = {
      totalUsers: users.length,
      newUsersToday: users.filter(u => {
        const createdAt = u.createdAt ? new Date(u.createdAt) : null
        return createdAt && createdAt >= today
      }).length,
      activeUsersToday: users.filter(u => {
        const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt) : null
        return lastLogin && lastLogin >= today
      }).length,
      activeUsersThisMonth: users.filter(u => {
        const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt) : null
        return lastLogin && lastLogin >= thisMonth
      }).length,
      paidUsers: users.filter(u => {
        const plan = u.plan as string
        return plan && plan !== 'free' && u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) > now
      }).length,
      retentionRate: users.length > 0 
        ? (users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) >= thisMonth).length / users.length * 100)
        : 0,
      // 保留原有字段以兼容旧代码
      total: users.length,
      byPlan: {
        free: users.filter(u => u.plan === 'free').length,
        weekly: users.filter(u => u.plan === 'weekly').length,
        monthly: users.filter(u => u.plan === 'monthly').length,
        yearly: users.filter(u => u.plan === 'yearly').length,
      },
      verified: users.filter(u => u.emailVerified).length,
      unverified: users.filter(u => !u.emailVerified).length,
      withActiveSubscription: users.filter(u => 
        u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) > now
      ).length,
      expiredSubscription: users.filter(u => 
        u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) <= now
      ).length,
      storage: process.env.KV_REST_API_URL ? 'KV' : process.env.REDIS_URL ? 'Redis' : 'File'
    }

    console.log(`[Admin Stats] Returning stats:`, {
      totalUsers: stats.totalUsers,
      storage: stats.storage,
      verified: stats.verified,
      unverified: stats.unverified
    })
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('[Admin Stats] API error:', error)
    console.error('[Admin Stats] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    }, { status: 500 })
  }
}
