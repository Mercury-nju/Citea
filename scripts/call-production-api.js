#!/usr/bin/env node

/**
 * 调用生产环境的测试 API 发送验证码
 * 
 * 使用方法:
 *   node scripts/call-production-api.js
 */

const TEST_EMAIL = 'lihongyangnju@gmail.com'
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://citea-2fuwy93mi-mercury-njus-projects.vercel.app'
const TEST_SECRET = 'test-verification-2025'

async function sendTestCode() {
  console.log('📧 通过生产环境 API 发送测试验证码\n')
  console.log(`🌐 生产地址: ${PRODUCTION_URL}`)
  console.log(`📧 收件邮箱: ${TEST_EMAIL}\n`)
  
  try {
    console.log('📤 正在调用 API...')
    const res = await fetch(`${PRODUCTION_URL}/api/test/send-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        secret: TEST_SECRET
      })
    })
    
    const contentType = res.headers.get('content-type') || ''
    let data
    
    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      const text = await res.text()
      console.error(`❌ 服务器返回了非 JSON 响应 (状态码: ${res.status})`)
      console.error(`响应预览: ${text.substring(0, 300)}...`)
      throw new Error('服务器响应格式错误')
    }
    
    if (res.ok && data.success) {
      console.log('\n✅ 邮件发送成功!')
      console.log(`邮件 ID: ${data.messageId || 'N/A'}`)
      console.log(`收件人: ${data.email}`)
      console.log(`验证码: ${data.code}`)
      console.log('\n📬 请检查以下位置:')
      console.log('  1. Gmail 收件箱')
      console.log('  2. 垃圾邮件文件夹 ⭐ (最重要!)')
      console.log('  3. 促销内容标签')
      console.log('\n⏱️  邮件通常在 1-5 分钟内到达')
      console.log('📧 邮件主题: "验证您的 Citea 账号"')
      console.log('🔍 搜索关键词: "Citea" 或 "验证码"')
      
      return { success: true, code: data.code }
    } else {
      console.error('\n❌ 邮件发送失败!')
      console.error(`错误: ${data.error || data.message || 'Unknown error'}`)
      
      if (data.error === 'Unauthorized') {
        console.error('\n💡 提示: API 密钥不匹配')
        console.error('解决方案: 检查 Vercel 环境变量 TEST_SECRET 是否设置为 "test-verification-2025"')
      }
      
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('\n❌ 请求失败!')
    console.error(`错误: ${error.message}`)
    
    if (error.message.includes('fetch failed')) {
      console.error('\n💡 可能原因:')
      console.error('  1. 网络连接失败')
      console.error('  2. 生产地址需要认证（预览部署）')
      console.error('  3. API 路由未部署')
    }
    
    return { success: false, error: error.message }
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

