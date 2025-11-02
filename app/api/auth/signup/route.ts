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
    
    // 发送验证邮件
    const emailResult = await sendVerificationEmail(email, verificationCode, name)
    
    if (!emailResult.success) {
      console.error('验证邮件发送失败:', emailResult.error)
      console.error('邮件发送详情:', JSON.stringify(emailResult, null, 2))
      
      // 邮件发送失败，但用户已创建，返回警告信息
      return NextResponse.json({ 
        user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
        needsVerification: true,
        message: '注册成功！但邮件发送失败。请检查邮箱配置或稍后重试。',
        emailError: true,
        emailErrorDetails: process.env.VERCEL_ENV !== 'production' ? emailResult.error : undefined
      }, { status: 201 })
    }

    console.log('验证邮件发送成功:', {
      email,
      messageId: (emailResult.data as any)?.messageId || 'sent',
      to: email
    })

    // 不自动登录，需要验证邮箱后才能登录
    return NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      needsVerification: true,
      message: '注册成功！请查看您的邮箱并输入验证码。'
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


