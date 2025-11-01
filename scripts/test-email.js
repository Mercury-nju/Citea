#!/usr/bin/env node

/**
 * 测试邮件发送
 * 
 * 使用方法:
 *   node scripts/test-email.js your@email.com
 */

const brevo = require('@getbrevo/brevo')
const fs = require('fs')
const path = require('path')

// 手动读取 .env.local
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

const testEmail = process.argv[2]

if (!testEmail) {
  console.error('请提供测试邮箱地址')
  console.log('使用方法: node scripts/test-email.js your@email.com')
  process.exit(1)
}

if (!process.env.BREVO_API_KEY) {
  console.error('❌ 未设置 BREVO_API_KEY')
  process.exit(1)
}

console.log('📧 测试邮件发送 (Brevo)...')
console.log('API Key:', process.env.BREVO_API_KEY.substring(0, 10) + '...')
console.log('收件人:', testEmail)
console.log()

const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
)

async function sendTestEmail() {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.to = [{ email: testEmail }]
    sendSmtpEmail.sender = {
      email: process.env.BREVO_FROM_EMAIL || 'noreply@brevo.com',
      name: 'Citea'
    }
    sendSmtpEmail.subject = '测试邮件 - Citea'
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #667eea;">Citea 邮件测试</h1>
          <p>如果您收到这封邮件，说明 Brevo 邮件服务配置正确！</p>
          <p>测试时间: ${new Date().toLocaleString('zh-CN')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">这是一封测试邮件</p>
        </body>
      </html>
    `

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ 发送成功!')
    console.log('邮件 ID:', result.messageId)
    console.log()
    console.log('请检查邮箱（包括垃圾邮件文件夹）')
  } catch (error) {
    console.error('❌ 发生错误:', error.message)
    if (error.response) {
      console.error('错误详情:', JSON.stringify(error.response.body, null, 2))
    }
  }
}

sendTestEmail()

