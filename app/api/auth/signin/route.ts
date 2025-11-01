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
      success: true
    })
    
    // 在响应对象上直接设置 cookie - 这是关键！
    response.cookies.set({
      name: 'citea_auth',
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    // 验证 cookie 是否被设置到响应头
    const allHeaders = response.headers.get('Set-Cookie')
    console.log('[Login] Set-Cookie 响应头:', allHeaders || '❌ 未找到')
    
    if (allHeaders) {
      console.log('[Login] ✅ Cookie 已设置到响应:', allHeaders.substring(0, 100))
    } else {
      // 如果上面的方法失败，尝试手动设置
      console.log('[Login] ⚠️ 自动设置失败，尝试手动设置...')
      response.headers.append('Set-Cookie', 
        `citea_auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
      )
      console.log('[Login] ✅ 手动设置 Set-Cookie header')
    }
    
    return response
  } catch (e) {
    console.error('[Login] ❌ 异常:', e)
    return NextResponse.json({ 
      error: 'Internal error: ' + (e instanceof Error ? e.message : 'Unknown error') 
    }, { status: 500 })
  }
}
