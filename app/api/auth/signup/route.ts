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
    
    const user = { 
      id: randomUUID(), 
      name, 
      email, 
      passwordHash, 
      plan: 'free',
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
      // 即使邮件发送失败，用户也已创建，返回成功但提示用户
    }

    // 不自动登录，需要验证邮箱后才能登录
    return NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      needsVerification: true,
      message: '注册成功！请查看您的邮箱并输入验证码。'
    }, { status: 201 })
  } catch (e) {
    console.error('Signup error:', e)
    return NextResponse.json({ 
      error: 'Internal error', 
      details: process.env.NODE_ENV === 'development' ? String(e) : undefined 
    }, { status: 500 })
  }
}


