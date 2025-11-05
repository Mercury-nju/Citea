import * as brevo from '@getbrevo/brevo'

// 初始化 Brevo API 客户端
function getBrevoClient() {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY not configured')
  }
  const apiInstance = new brevo.TransactionalEmailsApi()
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  )
  return apiInstance
}

export async function sendVerificationEmail(email: string, code: string, name: string) {
  // 如果没有配置 API key，返回错误但不阻止构建
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not configured, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }
  
  try {
    const apiInstance = getBrevoClient()
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    
    sendSmtpEmail.to = [{ email, name }]
    // 优先使用环境变量，否则使用Brevo默认邮箱（需要验证）
    // 重要：发件邮箱必须在Brevo账户中验证
    const senderEmail = process.env.BREVO_FROM_EMAIL || 'noreply@brevo.com'
    console.log('[Email] 发送验证码邮件:', { to: email, from: senderEmail })
    sendSmtpEmail.sender = {
      email: senderEmail,
      name: 'Citea'
    }
    // 更强的事务性主题，提升送达率（包含验证码）
    sendSmtpEmail.subject = `Citea 账户验证码：${code}`
    // 增加纯文本正文，避免部分邮箱过滤纯 HTML 邮件
    sendSmtpEmail.textContent = `您好，${name}：\n\n您的 Citea 验证码为：${code}\n有效期：10 分钟。\n如非本人操作，请忽略此邮件。\n\nCitea 团队\nhttps://citea.cc`
    // 设置回复邮箱，便于用户直接回复联系
    sendSmtpEmail.replyTo = { email: 'lihongyangnju@gmail.com', name: 'Citea Support' }
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Citea</h1>
            </div>
            <div class="content">
              <h2>您好, ${name}!</h2>
              <p>感谢您注册 Citea 账号。请使用以下验证码完成注册:</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <p>此验证码将在 <strong>10 分钟</strong>后过期。</p>
              <p>如果您没有注册 Citea 账号，请忽略此邮件。</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              
              <p style="color: #666; font-size: 14px;">
                <strong>Citea</strong> - 让学术诚信触手可及<br>
                免费的引用验证和文献查找工具
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Citea. All rights reserved.</p>
              <p>如有问题，请联系: support@citea.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    // 记录完整的响应信息，包括 messageId
    const messageId = (result as any)?.messageId || (result as any)?.body?.messageId || 'unknown'
    console.log('邮件发送成功:', {
      messageId,
      to: email,
      from: sendSmtpEmail.sender.email,
      subject: sendSmtpEmail.subject,
      code: code.substring(0, 2) + '****',
      fullResponse: JSON.stringify(result, null, 2)
    })
    
    return { success: true, data: result as any, messageId }
  } catch (error: any) {
    console.error('邮件发送异常:', {
      error: error.message,
      statusCode: error.statusCode,
      response: error.response?.body,
      to: email
    })
    
    // 提供更详细的错误信息
    let errorMessage = error.message || 'Unknown error'
    if (error.response?.body) {
      const body = typeof error.response.body === 'string' 
        ? JSON.parse(error.response.body) 
        : error.response.body
      errorMessage = body.message || body.error || errorMessage
      
      // Brevo 特定错误提示
      if (error.statusCode === 401) {
        errorMessage = 'BREVO_API_KEY 无效或已过期'
      } else if (error.statusCode === 400) {
        errorMessage = `邮件格式错误: ${errorMessage}`
      } else if (error.statusCode === 402) {
        errorMessage = 'Brevo 配额已用完（每日 300 封）'
      }
    }
    
    return { success: false, error: errorMessage, details: error.response?.body }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  // 如果没有配置 API key，返回错误但不阻止构建
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not configured, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }
  
  try {
    const apiInstance = getBrevoClient()
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    
    sendSmtpEmail.to = [{ email, name }]
    sendSmtpEmail.sender = {
      email: process.env.BREVO_FROM_EMAIL || 'lihongyangnju@gmail.com',
      name: 'Citea'
    }
    sendSmtpEmail.subject = '欢迎加入 Citea!'
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .features { margin: 20px 0; }
            .feature { margin: 10px 0; padding-left: 25px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 欢迎加入 Citea!</h1>
            </div>
            <div class="content">
              <h2>你好, ${name}!</h2>
              <p>恭喜您成功注册 Citea 账号！我们很高兴您加入我们的学术社区。</p>
              
              <h3>✨ 您现在可以使用:</h3>
              <div class="features">
                <div class="feature">📚 AI 文献查找 - 快速找到权威来源</div>
                <div class="feature">✓ 引用验证 - 检查引用真实性</div>
                <div class="feature">💬 AI 助手 - 智能研究帮助</div>
                <div class="feature">🔍 多数据库检索 - CrossRef, PubMed, arXiv 等</div>
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
                  开始使用 Citea
                </a>
              </p>
              
              <p>如有任何问题，随时联系我们的支持团队。</p>
              
              <p>祝您研究顺利！<br>Citea 团队</p>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('欢迎邮件发送异常:', error)
    return { success: false, error: error.message || error }
  }
}

