import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/userStore'
import { getAdminSession } from '@/lib/adminAuth'

// 获取所有用户（仅管理员）
export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Users] Checking authentication...')
    // 检查管理员认证（使用 cookie）
    const session = await getAdminSession()
    console.log('[Admin Users] Session check result:', {
      hasSession: !!session,
      username: session?.username
    })
    
    if (!session) {
      console.log('[Admin Users] No session found, checking Authorization header...')
      // 也支持 Bearer token 方式（兼容旧的认证方式）
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { verifyJwt } = await import('@/lib/auth')
        const jwtUser = await verifyJwt(token)
        const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []
        if (!jwtUser || !ADMIN_EMAILS.includes(jwtUser.email)) {
          console.log('[Admin Users] Bearer token authentication failed')
          return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
        }
        console.log('[Admin Users] Bearer token authentication successful')
      } else {
        console.log('[Admin Users] No session and no Authorization header, returning 401')
        // 返回更详细的错误信息
        return NextResponse.json({ 
          error: 'Unauthorized',
          message: '请先登录管理员账号',
          hint: 'Cookie authentication failed. Please log in again.'
        }, { status: 401 })
      }
    } else {
      console.log('[Admin Users] Session authentication successful')
    }

    // 获取分页参数
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = (page - 1) * limit
    
    console.log('[Admin Users] Pagination params:', { page, limit, offset })

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
        
        // 使用 SCAN 替代 KEYS（避免阻塞 Redis）
        const allKeys: string[] = []
        let cursor = '0'
        
        do {
          const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'user:*', 'COUNT', '100')
          cursor = nextCursor
          allKeys.push(...keys)
        } while (cursor !== '0')
        
        console.log(`[Admin Users] Found ${allKeys.length} user keys in Redis using SCAN`)
        
        // 先收集所有用户数据
        const allUsers: any[] = []
        
        // 使用 pipeline 批量读取（提升性能）
        const pipeline = redis.pipeline()
        for (const key of allKeys) {
          pipeline.hgetall(key)
        }
        const results = await pipeline.exec()
        
        // 处理结果
        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          if (result && result[1]) {
            const userData = result[1] as any
            if (userData && userData.id && userData.email) {
              allUsers.push({
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
          }
        }
        
        // 按创建时间排序（最新的在前）
        allUsers.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
        
        // 保存所有用户用于统计，但只返回分页后的用户
        const totalUsers = allUsers.length
        const paginatedUsers = allUsers.slice(offset, offset + limit)
        
        // 保存所有用户用于统计计算
        const allUsersForStats = [...allUsers]
        
        // 只返回分页后的用户
        users.push(...paginatedUsers)
        
        console.log(`[Admin Users] Loaded ${paginatedUsers.length} users (page ${page}, total: ${totalUsers})`)

        await redis.quit()
        
        // 使用所有用户计算统计信息
        const stats = {
          total: totalUsers,
          byPlan: {
            free: allUsersForStats.filter(u => u.plan === 'free').length,
            weekly: allUsersForStats.filter(u => u.plan === 'weekly').length,
            monthly: allUsersForStats.filter(u => u.plan === 'monthly').length,
            yearly: allUsersForStats.filter(u => u.plan === 'yearly').length,
          },
          verified: allUsersForStats.filter(u => u.emailVerified).length,
          unverified: allUsersForStats.filter(u => !u.emailVerified).length,
          withSubscription: allUsersForStats.filter(u => u.hasActiveSubscription).length,
          expired: allUsersForStats.filter(u => u.subscriptionExpiresAt && !u.hasActiveSubscription).length,
        }
        
        console.log(`[Admin Users] Successfully loaded ${users.length} users from Redis (page ${page} of ${Math.ceil(totalUsers / limit)})`)
        
        return NextResponse.json({
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
          stats,
          users: paginatedUsers,
          storage: 'Redis'
        })
      } catch (error) {
        console.error('[Admin Users] Redis error:', error)
        console.error('[Admin Users] Redis error details:', error instanceof Error ? error.message : String(error))
      }
    }
    
    // 如果 Redis 没有数据，尝试 Vercel KV 存储
    // 注意：如果同时配置了 REDIS_URL 和 KV_REST_API_URL，优先使用 Redis
    // 只有在 Redis 没有数据且配置了 KV 时才使用 KV
    if (users.length === 0 && process.env.KV_REST_API_URL && !process.env.REDIS_URL) {
      try {
        console.log('[Admin Users] Using Vercel KV storage (Redis not configured)')
        const kv = require('@vercel/kv')
        // 从用户索引获取所有用户邮箱
        const userIndex = await kv.get('users:index') as string[] | null
        console.log(`[Admin Users] KV user index:`, userIndex ? `${userIndex.length} users` : 'not found')
        
        if (userIndex && Array.isArray(userIndex) && userIndex.length > 0) {
          console.log(`[Admin Users] Found ${userIndex.length} users in KV index`)
          const allUsers: any[] = []
          
          for (const email of userIndex) {
            try {
              const user = await getUserByEmail(email)
              if (user) {
                allUsers.push({
                  id: user.id || user.email,
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
            } catch (userError) {
              console.error(`[Admin Users] Error loading user ${email} from KV:`, userError)
            }
          }
          
          // 按创建时间排序
          allUsers.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA
          })
          
          // 计算统计信息（基于所有用户）
          const totalUsers = allUsers.length
          const stats = {
            total: totalUsers,
            byPlan: {
              free: allUsers.filter(u => u.plan === 'free').length,
              weekly: allUsers.filter(u => u.plan === 'weekly').length,
              monthly: allUsers.filter(u => u.plan === 'monthly').length,
              yearly: allUsers.filter(u => u.plan === 'yearly').length,
            },
            verified: allUsers.filter(u => u.emailVerified).length,
            unverified: allUsers.filter(u => !u.emailVerified).length,
            withSubscription: allUsers.filter(u => u.hasActiveSubscription).length,
            expired: allUsers.filter(u => u.subscriptionExpiresAt && !u.hasActiveSubscription).length,
          }
          
          // 应用分页
          const paginatedUsers = allUsers.slice(offset, offset + limit)
          
          console.log(`[Admin Users] Successfully loaded ${paginatedUsers.length} users from KV (page ${page}, total: ${totalUsers})`)
          
          return NextResponse.json({
            total: totalUsers,
            page,
            limit,
            totalPages: Math.ceil(totalUsers / limit),
            stats,
            users: paginatedUsers,
            storage: 'KV'
          })
        } else {
          console.warn('[Admin Users] KV storage: User index not found or empty.')
          console.warn('[Admin Users] This means users were registered before the index feature was added.')
          console.warn('[Admin Users] KV does not support listing all keys, so we need the user index.')
        }
      } catch (error) {
        console.error('[Admin Users] KV error:', error)
        console.error('[Admin Users] KV error details:', error instanceof Error ? error.message : String(error))
      }
    }
    // 文件存储（仅用于本地开发，如果 Redis 和 KV 都没有配置）
    if (users.length === 0 && !process.env.REDIS_URL && !process.env.KV_REST_API_URL) {
      try {
        console.log('[Admin Users] Using file storage (local development only)')
        const fs = require('fs').promises
        const path = require('path')
        const DATA_DIR = path.join(process.cwd(), 'data')
        const USERS_FILE = path.join(DATA_DIR, 'users.json')
        
        try {
          const raw = await fs.readFile(USERS_FILE, 'utf8')
          const json = JSON.parse(raw || '{"users":[]}')
          
          for (const user of json.users || []) {
            users.push({
              id: user.id || user.email,
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
          console.log(`[Admin Users] Loaded ${users.length} users from file storage`)
        } catch (fileError: any) {
          // 文件不存在或无法读取，继续处理
          if (fileError.code !== 'ENOENT') {
            console.error('[Admin Users] File storage error:', fileError)
          } else {
            console.log('[Admin Users] Users file not found (normal for production)')
          }
        }
      } catch (error) {
        console.error('[Admin Users] File storage error:', error)
      }
    }

    // 记录最终结果
    console.log(`[Admin Users] Final result: ${users.length} users loaded`)
    console.log(`[Admin Users] Storage detection:`, {
      hasRedis: !!process.env.REDIS_URL,
      hasKV: !!process.env.KV_REST_API_URL,
      redisUrlType: process.env.REDIS_URL ? (process.env.REDIS_URL.startsWith('rediss://') ? 'SSL' : 'Standard') : 'None',
      usersLoaded: users.length
    })

    // 文件存储（仅用于本地开发，如果 Redis 和 KV 都没有配置）
    if (users.length === 0 && !process.env.REDIS_URL && !process.env.KV_REST_API_URL) {
      try {
        console.log('[Admin Users] Using file storage (local development only)')
        const fs = require('fs').promises
        const path = require('path')
        const DATA_DIR = path.join(process.cwd(), 'data')
        const USERS_FILE = path.join(DATA_DIR, 'users.json')
        
        try {
          const raw = await fs.readFile(USERS_FILE, 'utf8')
          const json = JSON.parse(raw || '{"users":[]}')
          
          const allUsers: any[] = []
          for (const user of json.users || []) {
            allUsers.push({
              id: user.id || user.email,
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
          
          // 按创建时间排序
          allUsers.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA
          })
          
          // 计算统计信息
          const totalUsers = allUsers.length
          const stats = {
            total: totalUsers,
            byPlan: {
              free: allUsers.filter(u => u.plan === 'free').length,
              weekly: allUsers.filter(u => u.plan === 'weekly').length,
              monthly: allUsers.filter(u => u.plan === 'monthly').length,
              yearly: allUsers.filter(u => u.plan === 'yearly').length,
            },
            verified: allUsers.filter(u => u.emailVerified).length,
            unverified: allUsers.filter(u => !u.emailVerified).length,
            withSubscription: allUsers.filter(u => u.hasActiveSubscription).length,
            expired: allUsers.filter(u => u.subscriptionExpiresAt && !u.hasActiveSubscription).length,
          }
          
          // 应用分页
          const paginatedUsers = allUsers.slice(offset, offset + limit)
          
          console.log(`[Admin Users] Loaded ${paginatedUsers.length} users from file storage (page ${page}, total: ${totalUsers})`)
          
          return NextResponse.json({
            total: totalUsers,
            page,
            limit,
            totalPages: Math.ceil(totalUsers / limit),
            stats,
            users: paginatedUsers,
            storage: 'File'
          })
        } catch (fileError: any) {
          // 文件不存在或无法读取，继续处理
          if (fileError.code !== 'ENOENT') {
            console.error('[Admin Users] File storage error:', fileError)
          } else {
            console.log('[Admin Users] Users file not found (normal for production)')
          }
        }
      } catch (error) {
        console.error('[Admin Users] File storage error:', error)
      }
    }

    // 如果没有加载到任何用户，返回空结果
    if (users.length === 0) {
      return NextResponse.json({
        total: 0,
        page,
        limit,
        totalPages: 0,
        stats: {
          total: 0,
          byPlan: { free: 0, weekly: 0, monthly: 0, yearly: 0 },
          verified: 0,
          unverified: 0,
          withSubscription: 0,
          expired: 0,
        },
        users: [],
        storage: process.env.KV_REST_API_URL ? 'KV' : process.env.REDIS_URL ? 'Redis' : 'File'
      })
    }
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
