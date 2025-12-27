import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signJwt } from '@/lib/auth'
import { getUserByEmail, createUser, updateUserVerification } from '@/lib/userStore'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    
    // 检查用户是否已存在
    const existingUser = await getUserByEmail(normalizedEmail)
    
    if (existingUser) {
      // 如果用户已验证，不允许重复注册
      if (existingUser.emailVerified) {
        return NextResponse.json({ 
          error: 'Email already registered',
          message: '该邮箱已注册并已验证。请直接登录。',
          verified: true
        }, { status: 409 })
      }
      
      // 如果用户未验证，允许重新注册（覆盖旧用户）
      console.log(`[Signup Local] User ${normalizedEmail} exists but not verified. Allowing re-registration.`)
    }

    // 生成验证码
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期

    // 哈希密码
    const passwordHash = await bcrypt.hash(password, 10)
    
    // 计算明天作为积分重置日期
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    // 创建用户对象
    const newUser = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      plan: 'free' as const,
      credits: 3,
      creditsResetDate: tomorrow.toISOString(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      emailVerified: false,
      verificationCode,
      verificationExpiry,
      authProvider: 'email' as const,
      googleId: undefined,
      avatar: undefined,
      subscriptionStartDate: undefined,
      subscriptionEndDate: undefined,
      subscriptionExpiresAt: undefined,
    }

    // 保存用户到文件存储
    await createUser(newUser)
    
    console.log('[Signup Local] ✅ 用户注册成功!', {
      userId: newUser.id,
      email: normalizedEmail,
      name: name.trim(),
      verificationCode
    })
    
    // 生成登录token（自动登录）
    const token = await signJwt({ 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email, 
      plan: newUser.plan 
    })
    
    // 返回成功响应（注意：本地模式下不发送邮件，验证码直接显示在日志中）
    return NextResponse.json({ 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        plan: newUser.plan 
      },
      token: token, // 本地模式下直接提供token，自动登录
      needsVerification: true,
      verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined, // 开发环境下返回验证码用于测试
      message: '注册成功！请使用验证码验证您的邮箱。'
    }, { status: 201 })
    
  } catch (e: any) {
    console.error('[Signup Local] Error:', e)
    console.error('Error stack:', e?.stack)
    
    return NextResponse.json({ 
      error: 'Internal error', 
      message: e?.message || 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (e?.message + '\n' + e?.stack) : undefined
    }, { status: 500 })
  }
}