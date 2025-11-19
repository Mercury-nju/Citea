import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signJwt } from '@/lib/auth'
import { getUserByEmail, updateUserLastLogin } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const user = await getUserByEmail(normalizedEmail)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: 'Account configuration error. Please contact support.' }, { status: 500 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // 检查邮箱是否已验证（Google登录用户除外，因为Google已验证了邮箱）
    if (!user.emailVerified && user.authProvider !== 'google') {
      return NextResponse.json({ 
        error: 'Email not verified',
        message: 'Please verify your email before signing in. Check your email for the verification link.',
        needsVerification: true
      }, { status: 403 })
    }

    await updateUserLastLogin(user.email)

    // 生成 token
    console.log('[SignIn] 生成 token for user:', user.email)
    const token = await signJwt({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      plan: user.plan 
    })
    
    console.log('[SignIn] Token 生成成功，长度:', token.length)
    console.log('[SignIn] Token 预览:', token.substring(0, 50))

    // 返回 token 和用户信息
    return NextResponse.json({ 
      success: true,
      token: token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        plan: user.plan 
      }
    })
  } catch (e) {
    console.error('[Login] Error:', e)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
