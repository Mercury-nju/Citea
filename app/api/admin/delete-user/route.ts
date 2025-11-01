import { NextResponse } from 'next/server'
import Redis from 'ioredis'

// 初始化 Redis 连接
function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL not configured')
  }
  
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
    throw new Error('Invalid REDIS_URL format')
  }
  
  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null
      return Math.min(times * 50, 2000)
    }
  })
}

export async function POST(req: Request) {
  try {
    const { email, adminKey } = await req.json()
    
    // 简单的管理员验证（生产环境应该使用更安全的方式）
    const expectedKey = process.env.ADMIN_KEY || 'delete-test-users-2025'
    if (adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // 检查是否有 Redis
    if (!process.env.REDIS_URL) {
      return NextResponse.json({ 
        error: 'REDIS_URL not configured',
        message: '数据库未配置，无法删除用户'
      }, { status: 500 })
    }

    const redis = getRedisClient()
    
    try {
      // 删除用户数据
      const key = `user:${email.toLowerCase()}`
      const existed = await redis.exists(key)
      
      if (!existed) {
        await redis.quit()
        return NextResponse.json({ 
          success: false,
          message: '用户不存在',
          email 
        })
      }
      
      await redis.del(key)
      await redis.quit()
      
      return NextResponse.json({ 
        success: true,
        message: '用户已删除',
        email 
      })
    } catch (error: any) {
      await redis.quit()
      throw error
    }
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete user',
      message: error.message 
    }, { status: 500 })
  }
}

// 列出所有用户（用于管理）
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminKey = searchParams.get('adminKey')
    
    const expectedKey = process.env.ADMIN_KEY || 'delete-test-users-2025'
    if (adminKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.REDIS_URL) {
      return NextResponse.json({ 
        error: 'REDIS_URL not configured' 
      }, { status: 500 })
    }

    const redis = getRedisClient()
    
    try {
      // 获取所有用户 key
      const keys = await redis.keys('user:*')
      const users = []
      
      for (const key of keys) {
        const userData = await redis.hgetall(key)
        if (userData && userData.email) {
          users.push({
            email: userData.email,
            name: userData.name,
            emailVerified: userData.emailVerified === 'true',
            createdAt: userData.createdAt,
          })
        }
      }
      
      await redis.quit()
      
      return NextResponse.json({ 
        success: true,
        count: users.length,
        users 
      })
    } catch (error: any) {
      await redis.quit()
      throw error
    }
  } catch (error: any) {
    console.error('List users error:', error)
    return NextResponse.json({ 
      error: 'Failed to list users',
      message: error.message 
    }, { status: 500 })
  }
}

