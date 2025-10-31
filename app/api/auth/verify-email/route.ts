import { NextResponse } from 'next/server'
import { verifyUserEmail, getUserByEmail } from '@/lib/userStore'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()
    
    if (!email || !code) {
      return NextResponse.json({ error: '缺少邮箱或验证码' }, { status: 400 })
    }

    // 验证邮箱
    const verified = await verifyUserEmail(email, code)
    
    if (!verified) {
      return NextResponse.json({ error: '验证码无效或已过期' }, { status: 400 })
    }

    // 获取用户信息
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 发送欢迎邮件
    await sendWelcomeEmail(email, user.name)

    // 自动登录
    const token = await signJwt({ id: user.id, name: user.name, email: user.email, plan: user.plan })
    await setAuthCookie(token)

    return NextResponse.json({ 
      success: true,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      message: '邮箱验证成功！'
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: '验证失败' }, { status: 500 })
  }
}

