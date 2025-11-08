import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { createUser, getUserByEmail, updateUserVerification } from '@/lib/userStore'
import { sendVerificationEmail } from '@/lib/email'

// 生成 6 位验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const existing = await getUserByEmail(String(email))
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    
    // 生成验证码
    const verificationCode = generateVerificationCode()
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 分钟后过期
    
    // 初始化免费用户的积分
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const user = { 
      id: randomUUID(), 
      name, 
      email, 
      passwordHash, 
      plan: 'free' as const,
      credits: 3, // 免费用户每天3积分
      creditsResetDate: tomorrow.toISOString(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      emailVerified: false,
      verificationCode,
      verificationExpiry
    }
    
    // 保存用户
    await createUser(user)
    
    // 临时方案：如果设置了环境变量，跳过邮件验证（用于紧急修复）
    const skipEmailVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true'
    
    if (skipEmailVerification) {
      console.warn('[Signup] 跳过邮件验证（SKIP_EMAIL_VERIFICATION=true）')
      // 直接标记为已验证
      const Redis = require('ioredis')
      if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis://')) {
        try {
          const redis = new Redis(process.env.REDIS_URL)
          await redis.hset(`user:${email.toLowerCase()}`, {
            emailVerified: 'true',
            verificationCode: '',
            verificationExpiry: ''
          })
          await redis.quit()
        } catch (err) {
          console.error('Redis update failed:', err)
        }
      }
      if (process.env.KV_REST_API_URL) {
        try {
          const kv = require('@vercel/kv')
          await kv.hset(`user:${email.toLowerCase()}`, {
            emailVerified: true,
            verificationCode: '',
            verificationExpiry: ''
          })
        } catch (err) {
          console.error('KV update failed:', err)
        }
      }
      // 自动登录
      const token = await signJwt({ id: user.id, email: user.email, name: user.name, plan: user.plan })
      setAuthCookie(token)
      return NextResponse.json({ 
        user: { id: user.id, name: user.name, email: user.email, plan: user.plan, emailVerified: true },
        message: '注册成功！',
        token,
        autoVerified: true
      }, { status: 201 })
    }
    
    // 发送验证邮件
    const emailResult = await sendVerificationEmail(email, verificationCode, name)
    
    if (!emailResult.success) {
      console.error('验证邮件发送失败:', emailResult.error)
      console.error('邮件发送详情:', JSON.stringify(emailResult, null, 2))
      
      // 检查是否是邮件服务未配置
      if (emailResult.error === 'Email service not configured' || !process.env.BREVO_API_KEY) {
        return NextResponse.json({ 
          error: '邮件服务未配置',
          message: '验证码邮件发送失败：邮件服务未正确配置。请联系管理员或稍后重试。',
          details: 'BREVO_API_KEY 未配置'
        }, { status: 500 })
      }
      
      // 其他邮件发送错误，返回错误信息让用户知道
      return NextResponse.json({ 
        error: '验证码发送失败',
        message: `验证码邮件发送失败：${emailResult.error || '未知错误'}`,
        details: emailResult.error,
        // 在开发环境或应急模式下，可以返回验证码
        verificationCode: process.env.EXPOSE_VERIFICATION_CODE === 'true' ? verificationCode : undefined
      }, { status: 500 })
    }

    console.log('验证邮件发送成功:', {
      email,
      messageId: (emailResult.data as any)?.messageId || 'sent',
      to: email
    })

    // 不自动登录，需要验证邮箱后才能登录
    // 只在开发环境或明确设置时才返回验证码
    const isDevelopment = process.env.NODE_ENV === 'development'
    const expose = process.env.EXPOSE_VERIFICATION_CODE === 'true'
    return NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      needsVerification: true,
      message: 'Registration successful! Please check your email and enter the verification code.',
      verificationCode: (isDevelopment || expose) ? verificationCode : undefined
    }, { status: 201 })
  } catch (e: any) {
    console.error('Signup error:', e)
    console.error('Error stack:', e?.stack)
    
    // 提供更详细的错误信息
    const errorMessage = e?.message || 'Internal error'
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // 如果是数据库配置问题，给出明确提示
    if (errorMessage.includes('Database not configured') || errorMessage.includes('KV_REST_API_URL')) {
      return NextResponse.json({ 
        error: 'Database not configured',
        message: 'Please configure Vercel KV or REDIS_URL in environment variables.',
        details: isDevelopment ? errorMessage : undefined
      }, { status: 500 })
    }
    
    // Redis 连接错误
    if (errorMessage.includes('Redis') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to database. Please check REDIS_URL configuration.',
        details: isDevelopment ? errorMessage : undefined
      }, { status: 500 })
    }
    
    // 在生产环境也返回一些有用的错误信息
    return NextResponse.json({ 
      error: 'Internal error', 
      message: errorMessage || 'An unexpected error occurred. Please try again later.',
      details: process.env.VERCEL_ENV !== 'production' ? (errorMessage + '\n' + e?.stack) : undefined
    }, { status: 500 })
  }
}


