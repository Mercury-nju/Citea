#!/usr/bin/env node

/**
 * 测试邮件发送
 * 
 * 使用方法:
 *   node scripts/test-email.js your@email.com
 */

const { Resend } = require('resend')
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

if (!process.env.RESEND_API_KEY) {
  console.error('❌ 未设置 RESEND_API_KEY')
  process.exit(1)
}

console.log('📧 测试邮件发送...')
console.log('API Key:', process.env.RESEND_API_KEY.substring(0, 10) + '...')
console.log('收件人:', testEmail)
console.log()

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Citea <onboarding@resend.dev>',
      to: [testEmail],
      subject: '测试邮件 - Citea',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #667eea;">Citea 邮件测试</h1>
            <p>如果您收到这封邮件，说明邮件服务配置正确！</p>
            <p>测试时间: ${new Date().toLocaleString('zh-CN')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">这是一封测试邮件</p>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ 发送失败:', error)
      return
    }

    console.log('✅ 发送成功!')
    console.log('邮件 ID:', data.id)
    console.log()
    console.log('请检查邮箱（包括垃圾邮件文件夹）')
  } catch (error) {
    console.error('❌ 发生错误:', error.message)
  }
}

sendTestEmail()

