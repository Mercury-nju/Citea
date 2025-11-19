import { NextResponse } from 'next/server'
import { verifyAdminPassword, createAdminSession, setAdminCookie } from '@/lib/adminAuth'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json({ error: '密码不能为空' }, { status: 400 })
    }

    const isValid = await verifyAdminPassword(password)

    if (!isValid) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    // 创建管理员 session
    const token = await createAdminSession('admin')
    await setAdminCookie(token)

    // 创建响应并设置 cookie（确保 cookie 被正确设置）
    const response = NextResponse.json({
      success: true,
      message: '登录成功'
    })

    // 也在响应中设置 cookie（双重保险）
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
    response.cookies.set('admin_auth', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/', // 根路径，确保所有路径都可以读取
    })

    console.log('[Admin Login] Cookie set in response:', {
      hasToken: !!token,
      secure: isProduction,
      path: '/',
      isProduction,
      vercel: process.env.VERCEL
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}

