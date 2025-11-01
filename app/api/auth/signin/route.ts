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
    
    // 立即测试验证这个 token
    const { verifyJwt } = await import('@/lib/auth')
    const testVerification = await verifyJwt(token)
    console.log('[SignIn] ✅ 生成后立即验证 token:', testVerification ? '成功' : '失败')
    if (!testVerification) {
      console.error('[SignIn] ❌ 严重错误：刚生成的 token 无法验证！')
      return NextResponse.json({ 
        error: 'Token generation failed. Please check server logs.' 
      }, { status: 500 })
    }

    // 只返回 token，不设置 cookie
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
