import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { getUserByEmail, updateUserLastLogin } from '@/lib/userStore'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    console.log('Login attempt for:', email)
    console.log('Password provided:', password ? 'yes' : 'no', '(length:', password?.length || 0, ')')
    
    const normalizedEmail = String(email).toLowerCase().trim()
    const user = await getUserByEmail(normalizedEmail)
    
    if (!user) {
      console.log('❌ User not found:', normalizedEmail)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    console.log('✅ User found:', { 
      email: user.email, 
      name: user.name,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length || 0,
      emailVerified: user.emailVerified 
    })

    if (!user.passwordHash) {
      console.error('❌ User exists but passwordHash is missing!')
      return NextResponse.json({ error: 'Account configuration error. Please contact support.' }, { status: 500 })
    }

    console.log('🔐 Comparing password...')
    const ok = await bcrypt.compare(password, user.passwordHash)
    console.log('🔐 Password match:', ok)
    
    if (!ok) {
      console.log('❌ Password mismatch for:', normalizedEmail)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // 检查邮箱是否已验证 - 在生产环境可以暂时跳过这个检查
    if (!user.emailVerified) {
      console.log('Email not verified for:', email)
      // 如果是在本地开发环境，自动验证
      if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
        console.log('Development mode: skipping email verification')
      } else {
        return NextResponse.json({ 
          error: '请先验证您的邮箱',
          needsVerification: true,
          email: user.email
        }, { status: 403 })
      }
    }

    // Update last login time
    await updateUserLastLogin(user.email)

    const token = await signJwt({ id: user.id, name: user.name, email: user.email, plan: user.plan })
    await setAuthCookie(token)
    
    console.log('Login successful for:', email)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan } })
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ 
      error: 'Internal error: ' + (e instanceof Error ? e.message : 'Unknown error') 
    }, { status: 500 })
  }
}


