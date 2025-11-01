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

    return NextResponse.json({
      success: true,
      message: '登录成功'
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}

