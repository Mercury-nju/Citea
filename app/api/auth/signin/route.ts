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

    await updateUserLastLogin(user.email)

    const token = await signJwt({ id: user.id, name: user.name, email: user.email, plan: user.plan })
    console.log('[Login] ✅ Token 生成成功，长度:', token.length)
    
    // 创建响应对象
    const response = NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      success: true,
      token: token // 也返回 token 作为备用方案
    })
    
    // 尝试多种方式设置 cookie
    try {
      // 方式1: 使用 response.cookies.set() 对象语法
      response.cookies.set({
        name: 'citea_auth',
        value: token,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      
      // 方式2: 使用手动设置 Set-Cookie header
      const cookieString = `citea_auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
      response.headers.set('Set-Cookie', cookieString)
      
      console.log('[Login] ✅ Cookie 设置完成（双重方式）')
    } catch (cookieError) {
      console.error('[Login] ⚠️ Cookie 设置异常:', cookieError)
    }
    
    // 验证
    const setCookieHeader = response.headers.get('Set-Cookie')
    console.log('[Login] 最终 Set-Cookie header:', setCookieHeader ? `✅ ${setCookieHeader.substring(0, 100)}` : '❌ 未设置')
    
    return response
  } catch (e) {
    console.error('[Login] ❌ 异常:', e)
    return NextResponse.json({ 
      error: 'Internal error: ' + (e instanceof Error ? e.message : 'Unknown error') 
    }, { status: 500 })
  }
}
