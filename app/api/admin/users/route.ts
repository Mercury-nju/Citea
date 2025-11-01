import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/adminAuth'
import Redis from 'ioredis'

function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null
  }
  
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
    return null
  }
  
  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > 3) return null
      return Math.min(times * 50, 2000)
    }
  })
}

export async function GET() {
  try {
    // 检查管理员权限
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.REDIS_URL) {
      return NextResponse.json({ users: [] })
    }

    const redis = getRedisClient()
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    try {
      // 获取所有用户
      const userKeys = await redis.keys('user:*')
      const users = []

      for (const key of userKeys) {
        const userData = await redis.hgetall(key)
        if (userData && userData.email) {
          users.push({
            id: userData.id,
            email: userData.email,
            name: userData.name || '未设置',
            plan: userData.plan || 'free',
            createdAt: userData.createdAt,
            lastLoginAt: userData.lastLoginAt,
            emailVerified: userData.emailVerified === 'true' || userData.emailVerified === true,
          })
        }
      }

      // 按注册时间倒序排列
      users.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })

      await redis.quit()

      return NextResponse.json({ users })
    } catch (error) {
      await redis.quit()
      throw error
    }
  } catch (error: any) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', message: error.message },
      { status: 500 }
    )
  }
}

