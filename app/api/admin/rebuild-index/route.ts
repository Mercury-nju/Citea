import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/adminAuth'
import { getUserByEmail } from '@/lib/userStore'

/**
 * 重建 KV 用户索引
 * 这个 API 用于在生产环境中重建用户索引
 * 需要在 KV 存储中手动扫描已知的用户邮箱
 */
export async function POST(request: NextRequest) {
  try {
    // 检查管理员认证
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 只支持 Vercel KV
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ 
        error: 'KV storage not configured',
        message: 'This endpoint only works with Vercel KV storage'
      }, { status: 400 })
    }

    const kv = require('@vercel/kv')
    const { body } = await request.json()
    const { emails } = body || {}

    let userEmails: string[] = []

    // 如果提供了邮箱列表，使用提供的列表
    if (emails && Array.isArray(emails)) {
      userEmails = emails.map((email: string) => email.toLowerCase())
    } else {
      // 否则尝试从已知的用户邮箱重建索引
      // 注意：KV 不支持列出所有 key，所以我们需要尝试常见的邮箱模式
      // 或者从其他地方获取用户邮箱列表
      
      // 尝试获取现有索引
      const existingIndex = await kv.get('users:index') as string[] | null
      if (existingIndex && Array.isArray(existingIndex)) {
        userEmails = existingIndex
      }
    }

    // 验证每个邮箱对应的用户是否存在
    const validEmails: string[] = []
    for (const email of userEmails) {
      try {
        const user = await getUserByEmail(email)
        if (user) {
          validEmails.push(email.toLowerCase())
        }
      } catch (error) {
        console.error(`Error checking user ${email}:`, error)
      }
    }

    // 更新用户索引
    if (validEmails.length > 0) {
      await kv.set('users:index', validEmails)
      return NextResponse.json({
        success: true,
        message: `User index rebuilt successfully`,
        usersFound: validEmails.length,
        users: validEmails
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No valid users found',
        suggestion: 'Please provide user emails in the request body: { "emails": ["user1@example.com", "user2@example.com"] }'
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Rebuild index error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * 获取当前用户索引状态
 */
export async function GET(request: NextRequest) {
  try {
    // 检查管理员认证
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 只支持 Vercel KV
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ 
        storage: 'redis',
        message: 'Using Redis storage, index not needed'
      })
    }

    const kv = require('@vercel/kv')
    const userIndex = await kv.get('users:index') as string[] | null

    if (userIndex && Array.isArray(userIndex)) {
      // 验证每个用户是否存在
      const validUsers = []
      for (const email of userIndex) {
        try {
          const user = await getUserByEmail(email)
          if (user) {
            validUsers.push({
              email: user.email,
              name: user.name,
              plan: user.plan
            })
          }
        } catch (error) {
          console.error(`Error checking user ${email}:`, error)
        }
      }

      return NextResponse.json({
        storage: 'kv',
        indexExists: true,
        indexSize: userIndex.length,
        validUsers: validUsers.length,
        users: validUsers
      })
    } else {
      return NextResponse.json({
        storage: 'kv',
        indexExists: false,
        message: 'User index not found. Please rebuild the index.',
        instruction: 'POST to this endpoint with user emails: { "emails": ["user1@example.com"] }'
      })
    }
  } catch (error) {
    console.error('Get index status error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

