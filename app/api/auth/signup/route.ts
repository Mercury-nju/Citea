import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/userStore'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Email already registered',
        message: '该邮箱已注册。请直接登录或使用忘记密码功能。',
      }, { status: 409 })
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // 生成验证码
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
    
    // Create user with local storage
    console.log('Creating user with local storage...')
    const userData = {
      id: randomUUID(), // Generate unique ID
      name,
      email: email.toLowerCase(),
      passwordHash,
      plan: 'free' as const,
      credits: 3,
      emailVerified: false, // Require email verification
      verificationCode,
      verificationExpiry,
      authProvider: 'email' as const
    }
    
    console.log('About to call createUser with:', email.toLowerCase())
    await createUser(userData)
    console.log('User created successfully:', email.toLowerCase())
    
    // Get the newly created user
    console.log('Retrieving newly created user...')
    const newUser = await getUserByEmail(email.toLowerCase())
    console.log('Retrieved user:', newUser ? 'found' : 'not found')
    if (!newUser) {
      return NextResponse.json({ 
        error: 'Registration failed',
        message: '注册失败，请稍后重试。'
      }, { status: 500 })
    }
    
    console.log('[Signup] ✅ 用户注册成功!', {
      userId: newUser.id,
      email,
      name,
      verificationCode
    })
    
    // 尝试发送验证邮件
    let emailSent = false
    let emailError = null
    
    try {
      // 检查是否有邮件服务配置（优先检查 Supabase）
      const hasSupabaseService = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
      const hasBrevoService = !!process.env.BREVO_API_KEY
      const hasResendService = !!process.env.RESEND_API_KEY
      const hasEmailService = hasSupabaseService || hasBrevoService || hasResendService
      
      if (hasEmailService) {
        const serviceName = hasSupabaseService ? 'Supabase' : (hasBrevoService ? 'Brevo' : 'Resend')
        console.log(`[Signup] ${serviceName} 邮件服务可用，正在发送验证码邮件...`)
        
        // 调用邮件发送函数
        const emailResult = await sendVerificationEmail(email, verificationCode, name)
        
        if (emailResult.success) {
          console.log(`[Signup] ✅ 验证码邮件发送成功! MessageId: ${emailResult.messageId}`)
          emailSent = true
        } else {
          console.error('[Signup] ❌ 验证码邮件发送失败:', emailResult.error)
          emailError = emailResult.error || '邮件发送失败'
        }
      } else {
        console.log('[Signup] ⚠️ 未配置邮件服务，无法发送验证码')
        emailError = '邮件服务未配置'
        
        // 开发环境下记录验证码用于测试
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Signup] 开发环境 - 验证码: ${verificationCode}`)
        }
      }
    } catch (error) {
      console.error('[Signup] 邮件发送失败:', error)
      emailError = '验证码发送失败'
    }
    
    // 注意：注册时不生成JWT token，用户必须通过邮箱验证后才能登录
    // const token = await signJwt({
    //   id: newUser.id,
    //   name: newUser.name,
    //   email: newUser.email,
    //   plan: newUser.plan
    // })
    
    console.log('[Signup] ✅ 用户注册成功! 需要邮箱验证。', {
      userId: newUser.id,
      email,
      name
    })
    
    return NextResponse.json({ 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        plan: newUser.plan 
      },
      // token, // 不返回token，用户必须通过验证
      needsVerification: true, // 需要邮箱验证
      emailSent: emailSent,
      emailError: emailError,
      verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined, // 开发环境返回验证码用于测试
      message: '注册成功！请检查您的邮箱并验证您的账户。'
    }, { status: 201 })
  } catch (e: any) {
    console.error('Signup error:', e)
    console.error('Error stack:', e?.stack)
    
    return NextResponse.json({ 
      error: 'Internal error', 
      message: e?.message || 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (e?.message + '\n' + e?.stack) : '注册过程中发生错误，请稍后重试。',
      errorType: e?.constructor?.name || 'UnknownError'
    }, { status: 500 })
  }
}
