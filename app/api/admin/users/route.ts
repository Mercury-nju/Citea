import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/userStore'
import { getAdminSession } from '@/lib/adminAuth'

// 获取所有用户（仅管理员）
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

    // 根据存储类型获取用户列表
    const users: any[] = []
    const Redis = require('ioredis')
    
    // Redis 存储（优先）
    if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
      try {
        console.log('[Admin Users] Connecting to Redis...')
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
        console.log('[Admin Users] Redis connected successfully')
        
        // 获取所有用户键
        const keys = await redis.keys('user:*')
        console.log(`[Admin Users] Found ${keys.length} user keys in Redis`)
        
        // 直接读取每个用户的数据
        for (const key of keys) {
          try {
            const userData = await redis.hgetall(key)
            if (userData && userData.id && userData.email) {
              users.push({
                id: userData.id || userData.email,
                email: userData.email,
                name: userData.name || '未设置',
                plan: userData.plan || 'free',
                emailVerified: userData.emailVerified === 'true' || userData.emailVerified === true,
                createdAt: userData.createdAt || new Date().toISOString(),
                lastLoginAt: userData.lastLoginAt,
                credits: userData.credits ? parseInt(userData.credits, 10) : 0,
                subscriptionExpiresAt: userData.subscriptionExpiresAt,
                hasActiveSubscription: userData.subscriptionExpiresAt && new Date(userData.subscriptionExpiresAt) > new Date()
              })
            }
          } catch (userError) {
            console.error(`[Admin Users] Error reading user from key ${key}:`, userError)
          }
        }

        await redis.quit()
        console.log(`[Admin Users] Successfully loaded ${users.length} users from Redis`)
      } catch (error) {
        console.error('[Admin Users] Redis error:', error)
        console.error('[Admin Users] Redis error details:', error instanceof Error ? error.message : String(error))
      }
    }
    
    // 如果 Redis 没有数据，尝试 Vercel KV 存储
    if (users.length === 0 && process.env.KV_REST_API_URL) {
      try {
        const kv = require('@vercel/kv')
        console.log('[Admin Users] Using Vercel KV storage')
        // 从用户索引获取所有用户邮箱
        const userIndex = await kv.get('users:index') as string[] | null
        if (userIndex && Array.isArray(userIndex) && userIndex.length > 0) {
          console.log(`[Admin Users] Found ${userIndex.length} users in KV index`)
          for (const email of userIndex) {
            const user = await getUserByEmail(email)
            if (user) {
              users.push({
                id: user.id || user.email, // 使用 id 或 email 作为 id
                email: user.email,
                name: user.name || '未设置',
                plan: user.plan || 'free',
                emailVerified: user.emailVerified || false,
                createdAt: user.createdAt || new Date().toISOString(),
                lastLoginAt: user.lastLoginAt,
                credits: user.credits || 0,
                subscriptionExpiresAt: user.subscriptionExpiresAt,
                hasActiveSubscription: user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date()
              })
            }
          }
          console.log(`[Admin Users] Successfully loaded ${users.length} users from KV`)
        } else {
          console.warn('[Admin Users] KV storage: User index not found or empty.')
          console.warn('[Admin Users] This means users were registered before the index feature was added.')
          console.warn('[Admin Users] Solution: Use /api/admin/rebuild-index endpoint to rebuild the index.')
        }
      } catch (error) {
        console.error('[Admin Users] KV error:', error)
      }
    }
    // 文件存储
    else {
      try {
        const fs = require('fs').promises
        const path = require('path')
        const DATA_DIR = path.join(process.cwd(), 'data')
        const USERS_FILE = path.join(DATA_DIR, 'users.json')
        
        try {
          const raw = await fs.readFile(USERS_FILE, 'utf8')
          const json = JSON.parse(raw || '{"users":[]}')
          
          for (const user of json.users || []) {
            users.push({
              id: user.id || user.email, // 使用 id 或 email 作为 id
              email: user.email,
              name: user.name || '未设置',
              plan: user.plan || 'free',
              emailVerified: user.emailVerified || false,
              createdAt: user.createdAt || new Date().toISOString(),
              lastLoginAt: user.lastLoginAt,
              credits: user.credits || 0,
              subscriptionExpiresAt: user.subscriptionExpiresAt,
              hasActiveSubscription: user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date()
            })
          }
        } catch (fileError: any) {
          // 文件不存在或无法读取，继续处理
          if (fileError.code !== 'ENOENT') {
            console.error('File storage error:', fileError)
          }
        }
      } catch (error) {
        console.error('File storage error:', error)
      }
    }

    // 计算统计信息
    const stats = {
      total: users.length,
      byPlan: {
        free: users.filter(u => u.plan === 'free').length,
        weekly: users.filter(u => u.plan === 'weekly').length,
        monthly: users.filter(u => u.plan === 'monthly').length,
        yearly: users.filter(u => u.plan === 'yearly').length,
      },
      verified: users.filter(u => u.emailVerified).length,
      unverified: users.filter(u => !u.emailVerified).length,
      withSubscription: users.filter(u => u.hasActiveSubscription).length,
      expired: users.filter(u => u.subscriptionExpiresAt && !u.hasActiveSubscription).length,
    }

    const sortedUsers = users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA // 最新的在前
    })

    console.log(`[Admin Users] Returning response:`, {
      total: users.length,
      usersCount: sortedUsers.length,
      storage: process.env.KV_REST_API_URL ? 'KV' : process.env.REDIS_URL ? 'Redis' : 'File',
      stats: {
        verified: stats.verified,
        unverified: stats.unverified,
        byPlan: stats.byPlan
      }
    })

    return NextResponse.json({
      total: users.length,
      stats: {
        ...stats,
        total: users.length
      },
      users: sortedUsers,
      storage: process.env.KV_REST_API_URL ? 'KV' : process.env.REDIS_URL ? 'Redis' : 'File'
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
