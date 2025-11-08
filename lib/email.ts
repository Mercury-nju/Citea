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
  // 检查 API key 配置
  if (!process.env.BREVO_API_KEY) {
    console.error('[Email] ❌ BREVO_API_KEY not configured')
    console.error('[Email] 请在 Vercel 环境变量中配置 BREVO_API_KEY')
    return { success: false, error: 'Email service not configured', details: 'BREVO_API_KEY 未配置' }
  }
  
  // 检查 API key 格式
  if (!process.env.BREVO_API_KEY.startsWith('xkeysib-')) {
    console.warn('[Email] ⚠️ BREVO_API_KEY 格式可能不正确（应该以 xkeysib- 开头）')
  }
  
  console.log('[Email] 📧 开始发送验证码邮件:', {
    to: email,
    codeLength: code.length,
    hasApiKey: !!process.env.BREVO_API_KEY,
    apiKeyPrefix: process.env.BREVO_API_KEY?.substring(0, 15) + '...',
    timestamp: new Date().toISOString()
  })
  
  try {
    const apiInstance = getBrevoClient()
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    
    sendSmtpEmail.to = [{ email, name }]
    // 优先使用环境变量，否则使用已验证的邮箱
    // 重要：发件邮箱必须在Brevo账户中验证
    const senderEmail = process.env.BREVO_FROM_EMAIL || 'lihongyangnju@gmail.com'
    console.log('[Email] 邮件配置:', { 
      to: email, 
      from: senderEmail,
      subject: `Citea 账户验证码：${code}`,
      hasHtml: true,
      hasText: true
    })
    
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

    console.log('[Email] 📤 正在调用 Brevo API 发送邮件...')
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    // 记录完整的响应信息，包括 messageId
    const messageId = (result as any)?.messageId || (result as any)?.body?.messageId || (result as any)?.messageId || 'unknown'
    
    console.log('[Email] ✅ 邮件发送成功!', {
      messageId,
      to: email,
      from: sendSmtpEmail.sender.email,
      subject: sendSmtpEmail.subject,
      codePreview: code.substring(0, 2) + '****',
      timestamp: new Date().toISOString(),
      responseType: typeof result,
      hasMessageId: !!messageId
    })
    
    // 如果 result 有 body 属性，记录它
    if ((result as any)?.body) {
      console.log('[Email] Brevo API 响应 body:', JSON.stringify((result as any).body, null, 2))
    }
    
    return { 
      success: true, 
      data: result as any, 
      messageId,
      sentAt: new Date().toISOString()
    }
  } catch (error: any) {
    // 详细记录错误信息
    console.error('[Email] ❌ 邮件发送失败!', {
      errorType: error.constructor?.name,
      errorMessage: error.message,
      statusCode: error.statusCode,
      status: error.status,
      code: error.code,
      to: email,
      timestamp: new Date().toISOString()
    })
    
    // 记录响应体
    if (error.response) {
      console.error('[Email] 错误响应:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        body: error.response.body
      })
    }
    
    // 提供更详细的错误信息
    let errorMessage = error.message || 'Unknown error'
    let errorDetails: any = {
      originalError: error.message,
      statusCode: error.statusCode || error.status,
      code: error.code
    }
    
    if (error.response?.body) {
      let body: any
      try {
        body = typeof error.response.body === 'string' 
          ? JSON.parse(error.response.body) 
          : error.response.body
        errorDetails.brevoResponse = body
        errorMessage = body.message || body.error || errorMessage
        
        // Brevo 特定错误提示
        if (error.statusCode === 401 || error.status === 401) {
          errorMessage = 'BREVO_API_KEY 无效或已过期。请检查 Vercel 环境变量中的 BREVO_API_KEY 是否正确。'
          errorDetails.suggestion = '请在 Brevo 控制台生成新的 API Key 并更新到 Vercel'
        } else if (error.statusCode === 400 || error.status === 400) {
          errorMessage = `邮件格式错误: ${errorMessage}`
          if (body.errors) {
            errorDetails.validationErrors = body.errors
          }
        } else if (error.statusCode === 402 || error.status === 402) {
          errorMessage = 'Brevo 配额已用完（每日 300 封免费邮件）。请升级到付费计划或等待明天重置。'
        } else if (error.statusCode === 403 || error.status === 403) {
          errorMessage = 'Brevo API 访问被拒绝。请检查 API Key 权限和发件邮箱是否已验证。'
        }
      } catch (parseError) {
        console.error('[Email] 无法解析错误响应体:', parseError)
        errorDetails.rawBody = error.response.body
      }
    }
    
    // 网络错误
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = '无法连接到 Brevo 邮件服务。请检查网络连接。'
      errorDetails.networkError = true
    }
    
    console.error('[Email] 最终错误信息:', {
      errorMessage,
      errorDetails,
      suggestion: '请检查 Vercel 日志获取更多详细信息'
    })
    
    return { 
      success: false, 
      error: errorMessage, 
      details: errorDetails,
      statusCode: error.statusCode || error.status
    }
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

