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
    
    // Redis 存储
    if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
      try {
        const redis = new Redis(process.env.REDIS_URL)
        const keys = await redis.keys('user:*')
        
        for (const key of keys) {
          const email = key.replace('user:', '')
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

        await redis.quit()
      } catch (error) {
        console.error('Redis error:', error)
      }
    }
    // Vercel KV 存储
    else if (process.env.KV_REST_API_URL) {
      try {
        const kv = require('@vercel/kv')
        // 从用户索引获取所有用户邮箱
        const userIndex = await kv.get('users:index') as string[] | null
        if (userIndex && Array.isArray(userIndex)) {
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
        } else {
          console.warn('KV storage: User index not found. No users will be displayed.')
        }
      } catch (error) {
        console.error('KV error:', error)
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
