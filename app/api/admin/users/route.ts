import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/userStore'

// 简单的管理员认证（可以通过环境变量设置管理员邮箱）
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

// 获取所有用户（仅管理员）
export async function GET(request: NextRequest) {
  try {
    // 检查认证
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { verifyJwt } = await import('@/lib/auth')
    const jwtUser = await verifyJwt(token)
    
    if (!jwtUser || !ADMIN_EMAILS.includes(jwtUser.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // 根据存储类型获取用户列表
    const users: any[] = []
    const stats = {
      total: 0,
      byPlan: {
        free: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0
      },
      verified: 0,
      unverified: 0,
      withSubscription: 0,
      expired: 0
    }

    // 检查存储类型
    const kv = require('@vercel/kv')
    const Redis = require('ioredis')
    
    // 如果是 KV 存储
    if (process.env.KV_REST_API_URL) {
      try {
        // KV 不支持直接列出所有 key，需要维护一个用户列表
        // 这里返回统计信息，实际用户列表需要从其他地方获取
        return NextResponse.json({
          message: 'KV storage detected. User listing requires a separate user index.',
          stats: stats,
          storage: 'KV'
        })
      } catch (error) {
        console.error('KV error:', error)
      }
    }

    // 如果是 Redis 存储
    if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis://')) {
      try {
        const redis = new Redis(process.env.REDIS_URL)
        const keys = await redis.keys('user:*')
        
        for (const key of keys) {
          const email = key.replace('user:', '')
          const user = await getUserByEmail(email)
          if (user) {
            users.push({
              email: user.email,
              name: user.name,
              plan: user.plan,
              emailVerified: user.emailVerified,
              createdAt: user.createdAt,
              lastLoginAt: user.lastLoginAt,
              credits: user.credits,
              subscriptionExpiresAt: user.subscriptionExpiresAt,
              hasActiveSubscription: user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date()
            })

            // 统计
            stats.total++
            const plan = user.plan as 'free' | 'weekly' | 'monthly' | 'yearly'
            if (plan && (plan === 'free' || plan === 'weekly' || plan === 'monthly' || plan === 'yearly')) {
              stats.byPlan[plan] = (stats.byPlan[plan] || 0) + 1
            }
            if (user.emailVerified) stats.verified++
            else stats.unverified++
            if (user.subscriptionExpiresAt) {
              if (new Date(user.subscriptionExpiresAt) > new Date()) {
                stats.withSubscription++
              } else {
                stats.expired++
              }
            }
          }
        }

        await redis.quit()
      } catch (error) {
        console.error('Redis error:', error)
      }
    }

    // 如果是文件存储
    if (users.length === 0) {
      try {
        const fs = require('fs').promises
        const path = require('path')
        const DATA_DIR = path.join(process.cwd(), 'data')
        const USERS_FILE = path.join(DATA_DIR, 'users.json')
        
        const raw = await fs.readFile(USERS_FILE, 'utf8')
        const json = JSON.parse(raw || '{"users":[]}')
        
        for (const user of json.users || []) {
          users.push({
            email: user.email,
            name: user.name,
            plan: user.plan,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            credits: user.credits,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            hasActiveSubscription: user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date()
          })

          // 统计
          stats.total++
          const plan = user.plan as 'free' | 'weekly' | 'monthly' | 'yearly'
          if (plan && (plan === 'free' || plan === 'weekly' || plan === 'monthly' || plan === 'yearly')) {
            stats.byPlan[plan] = (stats.byPlan[plan] || 0) + 1
          }
          if (user.emailVerified) stats.verified++
          else stats.unverified++
          if (user.subscriptionExpiresAt) {
            if (new Date(user.subscriptionExpiresAt) > new Date()) {
              stats.withSubscription++
            } else {
              stats.expired++
            }
          }
        }
      } catch (error) {
        console.error('File storage error:', error)
      }
    }

    return NextResponse.json({
      total: users.length,
      stats: {
        ...stats,
        total: users.length
      },
      users: users.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA // 最新的在前
      }),
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
