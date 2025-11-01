import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signJwt } from '@/lib/auth'
import { getUserByEmail, updateUserLastLogin } from '@/lib/userStore'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    console.log('[Login] 登录尝试:', email)

    const normalizedEmail = String(email).toLowerCase().trim()
    const user = await getUserByEmail(normalizedEmail)
    
    if (!user) {
      console.log('[Login] ❌ 用户不存在')
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.passwordHash) {
      console.error('[Login] ❌ 密码Hash不存在')
      return NextResponse.json({ error: 'Account configuration error. Please contact support.' }, { status: 500 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    
    if (!ok) {
      console.log('[Login] ❌ 密码错误')
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // 跳过邮箱验证检查（开发环境）
    if (!user.emailVerified && process.env.VERCEL) {
      console.log('[Login] ⚠️ 邮箱未验证，但在生产环境允许登录')
    }

    await updateUserLastLogin(user.email)

    const token = await signJwt({ id: user.id, name: user.name, email: user.email, plan: user.plan })
    console.log('[Login] ✅ Token 生成成功，长度:', token.length)
    
    // 创建响应
    const response = NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      success: true
    })
    
    // 设置 cookie - 使用最简单直接的方式
    const cookieValue = `citea_auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    response.headers.set('Set-Cookie', cookieValue)
    
    // 也尝试用 cookies().set() 方法
    response.cookies.set('citea_auth', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 604800, // 7 days
    })
    
    // 验证
    const setCookieHeader = response.headers.get('Set-Cookie')
    console.log('[Login] Cookie 设置结果:', setCookieHeader ? '✅ 成功' : '❌ 失败')
    if (setCookieHeader) {
      console.log('[Login] Set-Cookie:', setCookieHeader.substring(0, 100))
    }
    
    return response
  } catch (e) {
    console.error('[Login] ❌ 异常:', e)
    return NextResponse.json({ 
      error: 'Internal error: ' + (e instanceof Error ? e.message : 'Unknown error') 
    }, { status: 500 })
  }
}
