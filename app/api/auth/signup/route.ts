import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/userStore'
import bcrypt from 'bcryptjs'
import { signJwt } from '@/lib/auth'
import { randomUUID } from 'crypto'

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
    
    // Create user with local storage
    console.log('Creating user with local storage...')
    const userData = {
      id: randomUUID(), // Generate unique ID
      name,
      email: email.toLowerCase(),
      passwordHash,
      plan: 'free' as const,
      credits: 3,
      emailVerified: true, // Auto-verify for local development
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
      name
    })
    
    // Generate JWT token for immediate login
    const token = await signJwt({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      plan: newUser.plan
    })
    
    console.log('[Signup] ✅ 用户注册成功!', {
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
      token,
      needsVerification: false, // Auto-verified for local development
      message: '注册成功！欢迎加入 Citea！'
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
