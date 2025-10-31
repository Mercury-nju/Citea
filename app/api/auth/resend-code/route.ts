import { NextResponse } from 'next/server'
import { getUserByEmail, updateUserVerification } from '@/lib/userStore'
import { sendVerificationEmail } from '@/lib/email'

// 生成 6 位验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: '缺少邮箱' }, { status: 400 })
    }

    // 获取用户
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 如果已验证，不需要重新发送
    if (user.emailVerified) {
      return NextResponse.json({ error: '邮箱已验证' }, { status: 400 })
    }

    // 生成新验证码
    const verificationCode = generateVerificationCode()
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // 更新验证码
    await updateUserVerification(email, verificationCode, verificationExpiry)

    // 发送邮件
    const emailResult = await sendVerificationEmail(email, verificationCode, user.name)
    
    if (!emailResult.success) {
      return NextResponse.json({ error: '邮件发送失败' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: '验证码已重新发送！'
    })
  } catch (error) {
    console.error('Resend code error:', error)
    return NextResponse.json({ error: '重新发送失败' }, { status: 500 })
  }
}

