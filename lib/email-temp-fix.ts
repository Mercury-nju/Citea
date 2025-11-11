/**
 * 临时邮件发送修复
 * 使用 Brevo 发送验证码邮件，绕过 Supabase Magic Link 问题
 */

import axios from 'axios'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@citea.app'
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Citea'

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  details?: string
}

async function sendVerificationCodeViaBrevo(
  email: string,
  code: string,
  name: string
): Promise<EmailResult> {
  try {
    console.log('[Brevo Email] 📧 开始发送验证码邮件:', {
      to: email,
      codeLength: code.length,
      timestamp: new Date().toISOString()
    })

    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY 未配置')
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          email: BREVO_SENDER_EMAIL,
          name: BREVO_SENDER_NAME
        },
        to: [{
          email: email,
          name: name
        }],
        subject: 'Citea 验证码 - 请验证您的邮箱',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">欢迎加入 Citea！</h2>
            <p>您好 ${name}，</p>
            <p>感谢您注册 Citea。请使用以下验证码完成邮箱验证：</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 4px;">${code}</h1>
            </div>
            <p><strong>验证码有效期为 10 分钟</strong></p>
            <p>如果您没有注册 Citea，请忽略此邮件。</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              此邮件由 Citea 自动发送，请勿回复。
            </p>
          </div>
        `,
        textContent: `您好 ${name}，

感谢您注册 Citea。请使用以下验证码完成邮箱验证：

验证码：${code}

验证码有效期为 10 分钟。

如果您没有注册 Citea，请忽略此邮件。

此邮件由 Citea 自动发送，请勿回复。`
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('[Brevo Email] ✅ 邮件发送成功:', {
      messageId: response.data.messageId,
      email: email,
      status: response.status
    })

    return {
      success: true,
      messageId: response.data.messageId,
      details: '验证码邮件已通过 Brevo 发送'
    }

  } catch (error) {
    console.error('[Brevo Email] ❌ 邮件发送失败:', error)
    
    let errorMessage = '邮件发送失败'
    let details = '未知错误'
    
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message
      details = `Brevo API 错误: ${error.response?.status} - ${error.response?.data?.message || error.message}`
    } else if (error instanceof Error) {
      errorMessage = error.message
      details = error.stack || error.message
    }

    return {
      success: false,
      error: errorMessage,
      details: details
    }
  }
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  name: string
): Promise<EmailResult> {
  // 临时使用 Brevo 发送验证码邮件
  console.log('[Email] 使用 Brevo 临时方案发送验证码')
  return await sendVerificationCodeViaBrevo(email, code, name)
}

export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
  // 欢迎邮件暂时简化处理
  console.log('[Email] 欢迎邮件功能简化处理')
  return {
    success: true,
    messageId: `welcome-temp-${Date.now()}`,
    details: '欢迎邮件功能暂时简化处理'
  }
}