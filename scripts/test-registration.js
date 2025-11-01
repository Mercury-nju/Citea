#!/usr/bin/env node

/**
 * 测试注册和邮件发送功能
 * 
 * 使用方法:
 *   node scripts/test-registration.js
 */

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

// 测试邮箱
const TEST_EMAIL = 'lihongyangnju@gmail.com'
const TEST_NAME = 'Test User'
const TEST_PASSWORD = 'TestPassword123'

async function testRegistration() {
  console.log('🧪 开始测试注册和邮件发送功能...\n')
  
  // 1. 先删除测试账号（如果存在）
  console.log('1️⃣ 清理旧数据...')
  const Redis = require('ioredis')
  if (process.env.REDIS_URL) {
    try {
      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null
          return Math.min(times * 50, 2000)
        }
      })
      
      const key = `user:${TEST_EMAIL.toLowerCase()}`
      const exists = await redis.exists(key)
      if (exists) {
        await redis.del(key)
        console.log('   ✅ 已删除旧账号')
      } else {
        console.log('   ℹ️  账号不存在，无需删除')
      }
      await redis.quit()
    } catch (error) {
      console.log('   ⚠️  Redis 连接失败（继续测试）:', error.message)
    }
  } else {
    console.log('   ⚠️  REDIS_URL 未配置（跳过清理）')
  }
  
  // 2. 测试邮件发送
  console.log('\n2️⃣ 测试邮件发送...')
  console.log(`   收件邮箱: ${TEST_EMAIL}`)
  
  if (!process.env.BREVO_API_KEY) {
    console.error('   ❌ BREVO_API_KEY 未配置')
    console.log('\n   请在 .env.local 中配置:')
    console.log('   BREVO_API_KEY=xkeysib-your-key-here')
    process.exit(1)
  }
  
  const brevo = require('@getbrevo/brevo')
  const apiInstance = new brevo.TransactionalEmailsApi()
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  )
  
  const testCode = '123456'
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
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
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
              <div class="code">${testCode}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ 这是测试邮件</strong><br>
              如果您收到这封邮件，说明 Brevo 邮件服务配置正确！<br>
              请回复"收到"确认邮件送达。
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>测试时间:</strong> ${new Date().toLocaleString('zh-CN')}<br>
              <strong>发件人:</strong> ${process.env.BREVO_FROM_EMAIL || 'noreply@brevo.com'}<br>
              <strong>API Key:</strong> ${process.env.BREVO_API_KEY.substring(0, 15)}...
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  
  try {
    console.log('   📤 正在发送邮件...')
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    const messageId = result.messageId || (result.response?.body?.messageId) || 'sent'
    console.log('   ✅ 邮件发送成功!')
    console.log(`   邮件 ID: ${messageId}`)
    console.log(`   收件人: ${TEST_EMAIL}`)
    console.log(`   验证码: ${testCode}`)
    console.log('\n   📬 请检查以下位置:')
    console.log('     1. Gmail 收件箱')
    console.log('     2. 垃圾邮件文件夹')
    console.log('     3. 促销内容标签')
    console.log('\n   ⏱️  邮件通常在 1-5 分钟内到达')
    
    return { success: true, messageId }
  } catch (error) {
    console.error('   ❌ 邮件发送失败!')
    const errMsg = error?.message || String(error)
    console.error(`   错误: ${errMsg}`)
    
    if (error?.statusCode) {
      console.error(`   状态码: ${error.statusCode}`)
      
      if (error.statusCode === 401) {
        console.error('\n   💡 可能原因: BREVO_API_KEY 无效或已过期')
        console.error('   解决方案: 在 Brevo Dashboard 重新生成 API Key')
      } else if (error.statusCode === 400) {
        console.error('\n   💡 可能原因: 发件邮箱未验证')
        console.error('   解决方案: 使用 noreply@brevo.com 或验证自定义域名')
      } else if (error.statusCode === 402) {
        console.error('\n   💡 可能原因: Brevo 每日配额已用完（300 封）')
        console.error('   解决方案: 等待第二天重置或升级账户')
      }
    }
    
    if (error?.response?.body) {
      try {
        const body = typeof error.response.body === 'string' 
          ? JSON.parse(error.response.body) 
          : error.response.body
        console.error('   详细信息:', JSON.stringify(body, null, 2))
      } catch (e) {
        console.error('   响应内容:', error.response.body)
      }
    }
    
    return { success: false, error: error.message || String(error) }
  }
}

async function main() {
  try {
    const result = await testRegistration()
    
    console.log('\n' + '='.repeat(50))
    if (result.success) {
      console.log('✅ 测试完成 - 邮件已发送')
      console.log('📧 请检查邮箱确认是否收到')
    } else {
      console.log('❌ 测试失败 - 请查看上方错误信息')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ 测试异常:', error.message || String(error))
    process.exit(1)
  }
}

main()

