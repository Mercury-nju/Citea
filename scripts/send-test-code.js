#!/usr/bin/env node

/**
 * 直接发送测试验证码到指定邮箱
 * 
 * 使用方法:
 *   node scripts/send-test-code.js
 */

const fs = require('fs')
const path = require('path')
const brevo = require('@getbrevo/brevo')

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  })
}

const TEST_EMAIL = 'lihongyangnju@gmail.com'
const TEST_NAME = 'Test User'

// 生成 6 位验证码
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendTestCode() {
  console.log('📧 发送测试验证码\n')
  console.log(`收件邮箱: ${TEST_EMAIL}`)
  
  if (!process.env.BREVO_API_KEY) {
    console.error('\n❌ BREVO_API_KEY 未配置')
    console.log('\n请在 .env.local 中添加:')
    console.log('BREVO_API_KEY=xkeysib-your-key-here')
    console.log('\n或者从 Vercel 环境变量中复制 BREVO_API_KEY 到本地 .env.local')
    process.exit(1)
  }
  
  const verificationCode = generateCode()
  console.log(`验证码: ${verificationCode}\n`)
  
  const apiInstance = new brevo.TransactionalEmailsApi()
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  )
  
  const sendSmtpEmail = new brevo.SendSmtpEmail()
  
  sendSmtpEmail.to = [{ email: TEST_EMAIL, name: TEST_NAME }]
  sendSmtpEmail.sender = {
    email: process.env.BREVO_FROM_EMAIL || 'noreply@brevo.com',
    name: 'Citea'
  }
  sendSmtpEmail.subject = '验证您的 Citea 账号'
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
            <h2>您好, ${TEST_NAME}!</h2>
            <p>感谢您注册 Citea 账号。请使用以下验证码完成注册:</p>
            
            <div class="code-box">
              <div class="code">${verificationCode}</div>
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

  try {
    console.log('📤 正在发送邮件...')
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    const messageId = result.messageId || 'sent'
    console.log('\n✅ 邮件发送成功!')
    console.log(`邮件 ID: ${messageId}`)
    console.log(`收件人: ${TEST_EMAIL}`)
    console.log(`验证码: ${verificationCode}`)
    console.log('\n📬 请检查以下位置:')
    console.log('  1. Gmail 收件箱')
    console.log('  2. 垃圾邮件文件夹 ⭐ (最重要!)')
    console.log('  3. 促销内容标签')
    console.log('\n⏱️  邮件通常在 1-5 分钟内到达')
    console.log('📧 邮件主题: "验证您的 Citea 账号"')
    console.log('🔍 搜索关键词: "Citea" 或 "验证码"')
    
    // 同时保存验证码到 Redis（如果配置了）
    if (process.env.REDIS_URL) {
      try {
        const Redis = require('ioredis')
        const redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) return null
            return Math.min(times * 50, 2000)
          }
        })
        
        // 检查用户是否存在
        const key = `user:${TEST_EMAIL.toLowerCase()}`
        const exists = await redis.exists(key)
        
        if (exists) {
          // 更新验证码
          const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()
          await redis.hset(key, {
            verificationCode: verificationCode,
            verificationExpiry: expiry
          })
          console.log('\n✅ 验证码已保存到 Redis')
          console.log(`   有效期: 10 分钟`)
        } else {
          console.log('\n⚠️  用户不存在于 Redis，验证码未保存')
          console.log('   但邮件已发送，可以用于测试')
        }
        
        await redis.quit()
      } catch (redisError) {
        console.log('\n⚠️  Redis 连接失败，验证码未保存（邮件已发送）')
      }
    }
    
    return { success: true, code: verificationCode }
  } catch (error) {
    console.error('\n❌ 邮件发送失败!')
    const errMsg = error?.message || String(error)
    console.error(`错误: ${errMsg}`)
    
    if (error?.statusCode) {
      console.error(`状态码: ${error.statusCode}`)
      
      if (error.statusCode === 401) {
        console.error('\n💡 可能原因: BREVO_API_KEY 无效或已过期')
        console.error('解决方案:')
        console.error('  1. 检查 Brevo Dashboard 中的 API Key 状态')
        console.error('  2. 重新生成 API Key（如果需要）')
        console.error('  3. 更新 .env.local 或 Vercel 环境变量')
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
        console.error('\n详细信息:', JSON.stringify(body, null, 2))
      } catch (e) {
        console.error('\n响应内容:', error.response.body)
      }
    }
    
    return { success: false, error: errMsg }
  }
}

sendTestCode()
  .then(result => {
    console.log('\n' + '='.repeat(50))
    if (result.success) {
      console.log('✅ 测试完成 - 邮件已发送')
      console.log(`📧 验证码: ${result.code}`)
      console.log('\n💡 提示:')
      console.log('   - 如果没收到，优先检查垃圾邮件文件夹')
      console.log('   - Gmail 可能会把邮件放到"促销内容"标签')
      console.log('   - 邮件可能需要几分钟才能到达')
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

