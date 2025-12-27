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
    
    // Create user with local storage - Magic Link 模式不需要验证码
    console.log('Creating user with local storage (Magic Link mode)...')
    const userData = {
      id: randomUUID(), // Generate unique ID
      name,
      email: email.toLowerCase(),
      passwordHash,
      plan: 'free' as const,
      credits: 3,
      emailVerified: false, // Require email verification
      authProvider: 'email' as const
      // Magic Link 模式：移除了 verificationCode 和 verificationExpiry
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
      name
      // Magic Link 模式：移除了 verificationCode 日志
    })
    
    // 尝试发送验证邮件
    let emailSent = false
    let emailError = null
    
    try {
      // 检查 Supabase 邮件服务配置
      const hasSupabaseService = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
      
      if (hasSupabaseService) {
        console.log('[Signup] Supabase 邮件服务可用，正在发送 Magic Link 验证邮件...')
        
        // 调用邮件发送函数 - Magic Link 模式
        const emailResult = await sendVerificationEmail(email, '', name)
        
        if (emailResult.success) {
          console.log(`[Signup] ✅ Magic Link 邮件发送成功! MessageId: ${emailResult.messageId}`)
          emailSent = true
        } else {
          console.error('[Signup] ❌ Magic Link 邮件发送失败:', emailResult.error)
          emailError = emailResult.error || '邮件发送失败'
        }
      } else {
        console.log('[Signup] ⚠️ Supabase 邮件服务未配置')
        emailError = '邮件服务未配置'
      }
    } catch (error) {
      console.error('[Signup] 邮件发送失败:', error)
      emailError = '邮件发送失败'
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
      // Magic Link 模式：移除了 verificationCode 返回
      message: '注册成功！请检查您的邮箱并点击验证链接完成注册。'
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
