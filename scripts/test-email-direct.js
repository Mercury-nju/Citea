#!/usr/bin/env node

/**
 * 直接测试邮件发送（不通过 API）
 */

const fs = require('fs')
const path = require('path')

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
    }
  })
}

if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY 未配置')
  console.log('请在 .env.local 中配置 BREVO_API_KEY')
  process.exit(1)
}

const brevo = require('@getbrevo/brevo')
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
)

const TEST_EMAIL = 'lihongyangnju@gmail.com'
const TEST_CODE = '123456'
const TEST_NAME = 'Test User'

async function sendTestEmail() {
  console.log('🧪 测试邮件发送功能\n')
  console.log(`📧 收件邮箱: ${TEST_EMAIL}`)
  console.log(`🔑 验证码: ${TEST_CODE}`)
  console.log(`📤 发件人: ${process.env.BREVO_FROM_EMAIL || 'noreply@brevo.com'}\n`)
  
  const sendSmtpEmail = new brevo.SendSmtpEmail()
  
  sendSmtpEmail.to = [{ email: TEST_EMAIL, name: TEST_NAME }]
  sendSmtpEmail.sender = {
    email: process.env.BREVO_FROM_EMAIL || 'noreply@brevo.com',
    name: 'Citea'
  }
  sendSmtpEmail.subject = '🧪 测试邮件 - Citea 注册验证码'
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Citea 测试邮件</h1>
          </div>
          <div class="content">
            <h2>您好, ${TEST_NAME}!</h2>
            <p>这是一封测试邮件，用于验证邮件发送功能是否正常。</p>
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; color: #666;">测试验证码:</p>
              <div class="code">${TEST_CODE}</div>
            </div>
            
            <p>如果您收到这封邮件，说明 Brevo 邮件服务配置正确！</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>测试时间:</strong> ${new Date().toLocaleString('zh-CN')}<br>
              <strong>发件人:</strong> ${process.env.BREVO_FROM_EMAIL || 'noreply@brevo.com'}
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
  try {
    console.log('📤 正在发送邮件...')
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    const messageId = result.messageId || 'sent'
    console.log('\n✅ 邮件发送成功!')
    console.log(`   邮件 ID: ${messageId}`)
    console.log(`   收件人: ${TEST_EMAIL}`)
    console.log(`   验证码: ${TEST_CODE}`)
    console.log('\n📬 请检查以下位置:')
    console.log('   1. Gmail 收件箱')
    console.log('   2. 垃圾邮件文件夹 ⭐ (最重要!)')
    console.log('   3. 促销内容标签')
    console.log('\n⏱️  邮件通常在 1-5 分钟内到达')
    console.log('\n📧 邮件主题: "🧪 测试邮件 - Citea 注册验证码"')
    console.log('🔍 搜索关键词: "Citea" 或 "测试"')
    
    return { success: true }
  } catch (error) {
    console.error('\n❌ 邮件发送失败!')
    const errMsg = error?.message || String(error)
    console.error(`   错误: ${errMsg}`)
    
    if (error?.statusCode) {
      console.error(`   状态码: ${error.statusCode}`)
      
      if (error.statusCode === 401) {
        console.error('\n💡 可能原因: BREVO_API_KEY 无效或已过期')
        console.error('解决方案: 在 Brevo Dashboard 重新生成 API Key')
      } else if (error.statusCode === 400) {
        console.error('\n💡 可能原因: 发件邮箱未验证')
        console.error('解决方案: 使用 noreply@brevo.com 或验证自定义域名')
      } else if (error.statusCode === 402) {
        console.error('\n💡 可能原因: Brevo 每日配额已用完（300 封）')
        console.error('解决方案: 等待第二天重置或升级账户')
      }
    }
    
    if (error?.response?.body) {
      try {
        const body = typeof error.response.body === 'string' 
          ? JSON.parse(error.response.body) 
          : error.response.body
        console.error('详细信息:', JSON.stringify(body, null, 2))
      } catch (e) {
        console.error('响应内容:', error.response.body)
      }
    }
    
    return { success: false }
  }
}

sendTestEmail()
  .then(result => {
    console.log('\n' + '='.repeat(50))
    if (result.success) {
      console.log('✅ 测试完成 - 邮件已发送')
      console.log('📧 请检查邮箱确认是否收到')
      console.log('\n💡 提示:')
      console.log('   - 如果没收到，优先检查垃圾邮件文件夹')
      console.log('   - Gmail 可能会把邮件放到"促销内容"标签')
      process.exit(0)
    } else {
      console.log('❌ 测试失败 - 请查看上方错误信息')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ 测试异常:', error.message)
    process.exit(1)
  })

