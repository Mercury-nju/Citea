#!/usr/bin/env node

/**
 * 测试生产环境的邮件发送功能
 * 直接调用 Vercel 部署的 API
 * 
 * 使用方法:
 *   node scripts/test-production-email.js
 */

const TEST_EMAIL = 'lihongyangnju@gmail.com'
const PRODUCTION_URL = 'https://citea-2fuwy93mi-mercury-njus-projects.vercel.app'

async function testProductionEmail() {
  console.log('🧪 测试生产环境邮件发送功能...\n')
  console.log(`📧 测试邮箱: ${TEST_EMAIL}`)
  console.log(`🌐 生产地址: ${PRODUCTION_URL}\n`)

  // 直接测试邮件发送 API
  console.log('1️⃣ 测试邮件发送...')
  try {
    const emailRes = await fetch(`${PRODUCTION_URL}/api/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    })
    
    // 检查响应类型
    const contentType = emailRes.headers.get('content-type') || ''
    let emailData
    
    if (contentType.includes('application/json')) {
      emailData = await emailRes.json()
    } else {
      const text = await emailRes.text()
      console.error(`   ⚠️  服务器返回了非 JSON 响应 (状态码: ${emailRes.status})`)
      console.error(`   响应类型: ${contentType}`)
      console.error(`   响应预览: ${text.substring(0, 200)}...`)
      throw new Error(`API 返回了 HTML 而不是 JSON (可能是路由不存在或错误页面)`)
    }
    
    if (emailRes.ok && emailData.success) {
      console.log('   ✅ 邮件发送成功!')
      console.log(`   邮件 ID: ${emailData.messageId || 'N/A'}`)
      console.log(`   收件人: ${TEST_EMAIL}`)
      console.log('\n   📬 请检查以下位置:')
      console.log('     1. Gmail 收件箱')
      console.log('     2. 垃圾邮件文件夹 ⭐ (最重要!)')
      console.log('     3. 促销内容标签')
      console.log('\n   ⏱️  邮件通常在 1-5 分钟内到达')
      console.log('\n   📧 邮件主题: "🧪 测试邮件 - Citea 注册验证码"')
      console.log('   🔍 搜索关键词: "Citea" 或 "noreply@brevo.com"')
      
      return { success: true }
    } else {
      console.error('   ❌ 邮件发送失败!')
      console.error(`   错误: ${emailData.error || emailData.message || 'Unknown error'}`)
      
      if (emailData.details) {
        console.error('   详细信息:', JSON.stringify(emailData.details, null, 2))
      }
      
      // 显示诊断信息
      if (emailData.config) {
        console.log('\n   配置状态:')
        console.log(`   - API Key: ${emailData.config.hasBrevoKey ? '✅' : '❌'}`)
        console.log(`   - From Email: ${emailData.config.fromEmail || 'N/A'}`)
      }
      
      return { success: false, error: emailData.error }
    }
  } catch (error) {
    console.error('   ❌ 请求失败!')
    console.error(`   错误: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function main() {
  try {
    const result = await testProductionEmail()
    
    console.log('\n' + '='.repeat(50))
    if (result.success) {
      console.log('✅ 测试完成 - 邮件已发送')
      console.log('📧 请检查邮箱确认是否收到')
      console.log('\n💡 提示:')
      console.log('   - 如果没收到，优先检查垃圾邮件文件夹')
      console.log('   - Gmail 可能会把邮件放到"促销内容"标签')
      console.log('   - 邮件可能需要几分钟才能到达')
    } else {
      console.log('❌ 测试失败 - 请查看上方错误信息')
      console.log('\n💡 排查建议:')
      console.log('   1. 检查 Vercel 环境变量 BREVO_API_KEY')
      console.log('   2. 检查 Brevo Dashboard 中的 API Key 状态')
      console.log('   3. 检查 Brevo 发送配额（每日 300 封）')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ 测试异常:', error.message)
    process.exit(1)
  }
}

main()

