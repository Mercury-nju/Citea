import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/userStore'

// 简单的管理员认证
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

// 获取用户统计信息（仅管理员）
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
      withActiveSubscription: 0,
      expiredSubscription: 0,
      storage: process.env.KV_REST_API_URL ? 'KV' : process.env.REDIS_URL ? 'Redis' : 'File'
    }

    // 根据存储类型获取统计
    const Redis = require('ioredis')
    
    // Redis 存储
    if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis://')) {
      try {
        const redis = new Redis(process.env.REDIS_URL)
        const keys = await redis.keys('user:*')
        
        for (const key of keys) {
          const email = key.replace('user:', '')
          const user = await getUserByEmail(email)
          if (user) {
            stats.total++
            const plan = user.plan as 'free' | 'weekly' | 'monthly' | 'yearly'
            if (plan && (plan === 'free' || plan === 'weekly' || plan === 'monthly' || plan === 'yearly')) {
              stats.byPlan[plan] = (stats.byPlan[plan] || 0) + 1
            }
            if (user.emailVerified) stats.verified++
            else stats.unverified++
            if (user.subscriptionExpiresAt) {
              if (new Date(user.subscriptionExpiresAt) > new Date()) {
                stats.withActiveSubscription++
              } else {
                stats.expiredSubscription++
              }
            }
          }
        }

        await redis.quit()
      } catch (error) {
        console.error('Redis error:', error)
      }
    }

    // 文件存储
    if (stats.total === 0 && !process.env.KV_REST_API_URL && !process.env.REDIS_URL) {
      try {
        const fs = require('fs').promises
        const path = require('path')
        const DATA_DIR = path.join(process.cwd(), 'data')
        const USERS_FILE = path.join(DATA_DIR, 'users.json')
        
        const raw = await fs.readFile(USERS_FILE, 'utf8')
        const json = JSON.parse(raw || '{"users":[]}')
        
        for (const user of json.users || []) {
          stats.total++
          const plan = user.plan as 'free' | 'weekly' | 'monthly' | 'yearly'
          if (plan && (plan === 'free' || plan === 'weekly' || plan === 'monthly' || plan === 'yearly')) {
            stats.byPlan[plan] = (stats.byPlan[plan] || 0) + 1
          }
          if (user.emailVerified) stats.verified++
          else stats.unverified++
          if (user.subscriptionExpiresAt) {
            if (new Date(user.subscriptionExpiresAt) > new Date()) {
              stats.withActiveSubscription++
            } else {
              stats.expiredSubscription++
            }
          }
        }
      } catch (error) {
        console.error('File storage error:', error)
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
