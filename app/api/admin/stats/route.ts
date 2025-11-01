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
      return NextResponse.json({
        totalUsers: 0,
        newUsersToday: 0,
        activeUsersToday: 0,
        activeUsersThisMonth: 0,
        paidUsers: 0,
        retentionRate: 0,
      })
    }

    const redis = getRedisClient()
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    try {
      // 获取所有用户
      const userKeys = await redis.keys('user:*')
      const users = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      let newUsersToday = 0
      let activeUsersToday = 0
      let activeUsersThisMonth = 0
      let paidUsers = 0

      for (const key of userKeys) {
        const userData = await redis.hgetall(key)
        if (userData && userData.email) {
          users.push(userData)

          // 统计新用户（今天注册）
          if (userData.createdAt) {
            const createdAt = new Date(userData.createdAt)
            if (createdAt >= today) {
              newUsersToday++
            }
          }

          // 统计活跃用户（今天登录）
          if (userData.lastLoginAt) {
            const lastLogin = new Date(userData.lastLoginAt)
            if (lastLogin >= today) {
              activeUsersToday++
            }
            if (lastLogin >= thisMonth) {
              activeUsersThisMonth++
            }
          }

          // 统计付费用户
          if (userData.plan && userData.plan !== 'free') {
            paidUsers++
          }
        }
      }

      // 计算留存率（简化版：7天留存）
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const usersRegisteredWeekAgo = users.filter(u => {
        if (!u.createdAt) return false
        const createdAt = new Date(u.createdAt)
        return createdAt >= sevenDaysAgo && createdAt < new Date(sevenDaysAgo.getTime() + 24 * 60 * 60 * 1000)
      })

      const usersActiveThisWeek = users.filter(u => {
        if (!u.lastLoginAt) return false
        const lastLogin = new Date(u.lastLoginAt)
        return lastLogin >= sevenDaysAgo
      })

      const retentionRate = usersRegisteredWeekAgo.length > 0
        ? (usersActiveThisWeek.length / usersRegisteredWeekAgo.length) * 100
        : 0

      await redis.quit()

      return NextResponse.json({
        totalUsers: users.length,
        newUsersToday,
        activeUsersToday,
        activeUsersThisMonth,
        paidUsers,
        retentionRate: Math.min(100, Math.max(0, retentionRate)),
      })
    } catch (error) {
      await redis.quit()
      throw error
    }
  } catch (error: any) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', message: error.message },
      { status: 500 }
    )
  }
}

