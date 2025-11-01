import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // 检查配置
    const hasBrevoKey = !!process.env.BREVO_API_KEY
    const hasBrevoEmail = !!process.env.BREVO_FROM_EMAIL
    
    if (!hasBrevoKey) {
      return NextResponse.json({
        error: 'BREVO_API_KEY not configured',
        config: {
          hasBrevoKey: false,
          hasBrevoEmail,
        }
      }, { status: 500 })
    }

    // 发送测试邮件
    const testCode = '123456'
    const result = await sendVerificationEmail(email, testCode, 'Test User')

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? '测试邮件已发送，请检查收件箱（包括垃圾邮件文件夹）'
        : '邮件发送失败',
      error: result.error,
      details: result.details,
      config: {
        hasBrevoKey,
        hasBrevoEmail,
        fromEmail: process.env.BREVO_FROM_EMAIL || 'noreply@brevo.com',
        apiKeyPrefix: process.env.BREVO_API_KEY?.substring(0, 15) + '...' || 'NOT SET'
      },
      messageId: (result.data as any)?.messageId || 'sent'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

