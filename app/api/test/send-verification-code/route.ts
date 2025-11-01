import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

// 生成 6 位验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    // 简单的安全验证（生产环境应该使用更安全的方式）
    const { email, secret } = await req.json()
    
    // 使用环境变量中的密钥或默认值
    const expectedSecret = process.env.TEST_SECRET || 'test-verification-2025'
    if (secret !== expectedSecret) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid secret key'
      }, { status: 401 })
    }
    
    const testEmail = email || 'lihongyangnju@gmail.com'
    const testCode = generateVerificationCode()
    const testName = 'Test User'
    
    console.log('📧 发送测试验证码:', {
      email: testEmail,
      code: testCode.substring(0, 2) + '****'
    })
    
    // 发送验证邮件
    const emailResult = await sendVerificationEmail(testEmail, testCode, testName)
    
    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error,
        message: '邮件发送失败'
      }, { status: 500 })
    }
    
    // 保存验证码到 Redis（如果用户存在）
    if (process.env.REDIS_URL) {
      try {
        const Redis = require('ioredis')
        const redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            if (times > 3) return null
            return Math.min(times * 50, 2000)
          }
        })
        
        const key = `user:${testEmail.toLowerCase()}`
        const exists = await redis.exists(key)
        
        if (exists) {
          const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()
          await redis.hset(key, {
            verificationCode: testCode,
            verificationExpiry: expiry
          })
        }
        
        await redis.quit()
      } catch (redisError) {
        console.warn('Redis 更新失败（不影响邮件发送）:', redisError)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      email: testEmail,
      code: testCode, // 仅用于测试，生产环境不应该返回
      messageId: (emailResult.data as any)?.messageId
    })
  } catch (error: any) {
    console.error('发送测试验证码失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

