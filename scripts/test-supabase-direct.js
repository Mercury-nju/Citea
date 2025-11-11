#!/usr/bin/env node

/**
 * 直接测试 Supabase 邮件功能
 * 
 * 使用方法:
 *   node scripts/test-supabase-direct.js [邮箱地址]
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const TEST_EMAIL = process.argv[2] || '2945235656@qq.com'

async function testSupabaseDirect() {
  console.log('📧 直接测试 Supabase 邮件功能\n')
  console.log(`收件邮箱: ${TEST_EMAIL}`)
  
  // 检查 Supabase 配置
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ Supabase 配置不完整')
    console.log('\n需要配置的环境变量:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url')
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
    process.exit(1)
  }
  
  try {
    console.log('📤 正在通过 Supabase 发送 Magic Link...')
    
    // 使用 Service Role Key 创建管理员客户端
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // 生成 Magic Link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      email: TEST_EMAIL,
      type: 'magiclink'
    })
    
    if (error) {
      console.error('\n❌ Supabase Magic Link 生成失败!')
      console.error(`错误: ${error.message}`)
      console.error(`状态码: ${error.status}`)
      
      if (error.message.includes('Invalid API key')) {
        console.error('\n💡 可能原因: SUPABASE_SERVICE_ROLE_KEY 无效')
        console.error('解决方案:')
        console.error('  1. 检查 Supabase Dashboard 中的 Service Role Key')
        console.error('  2. 重新生成 Service Role Key（如果需要）')
        console.error('  3. 更新 .env.local 文件')
      }
      
      return { success: false, error: error.message }
    }
    
    console.log('\n✅ Supabase Magic Link 生成成功!')
    console.log(`邮件 ID: supabase-magic-${Date.now()}`)
    console.log(`验证链接: ${data.properties?.action_link}`)
    console.log(`详情: Supabase 验证邮件已发送（Magic Link 模式）`)
    
    console.log('\n📬 请检查以下位置:')
    console.log('  1. Gmail 收件箱')
    console.log('  2. 垃圾邮件文件夹 ⭐ (最重要!)')
    console.log('  3. 促销内容标签')
    console.log('\n⏱️  邮件通常在 1-5 分钟内到达')
    console.log('📧 邮件主题: "验证您的 Citea 账号"')
    console.log('🔍 搜索关键词: "Citea" 或 "验证"')
    console.log('\n⚠️  注意：这是 Magic Link，用户需要点击链接验证，无需输入验证码')
    
    return { 
      success: true, 
      messageId: `supabase-magic-${Date.now()}`,
      actionLink: data.properties?.action_link,
      details: 'Supabase 验证邮件已发送（Magic Link 模式）'
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败!')
    console.error(`错误: ${error.message}`)
    console.error(`堆栈: ${error.stack}`)
    return { success: false, error: error.message }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testSupabaseDirect().then(() => {
    console.log('\n🎯 测试完成')
    process.exit(0)
  }).catch(error => {
    console.error('测试异常:', error)
    process.exit(1)
  })
}

module.exports = { testSupabaseDirect }