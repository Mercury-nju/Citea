#!/usr/bin/env node

/**
 * 测试 Supabase 邮件发送功能 - 使用新的项目配置
 * 
 * 使用方法:
 *   node scripts/test-supabase-email.js [邮箱地址]
 * 
 * 注意：在运行此脚本前，请确保已更新 .env.local 中的 Supabase 配置
 */

const path = require('path')

// 设置项目根目录
process.chdir(path.join(__dirname, '..'))

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

// 直接使用 TypeScript 文件，让 Node.js 处理
const { sendVerificationEmail } = require('../lib/email.ts')

const TEST_EMAIL = process.argv[2] || '66597405@qq.com'
const TEST_NAME = 'Test User'

async function testSupabaseEmail() {
  console.log('📧 测试 Supabase 邮件发送功能\n')
  console.log(`收件邮箱: ${TEST_EMAIL}`)
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || '未配置'}`)
  
  // 检查 Supabase 配置
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ Supabase 配置不完整')
    console.log('\n需要配置的环境变量:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url')
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
    console.log('\n💡 请参考 CREATE_NEW_SUPABASE_PROJECT.md 创建新项目')
    process.exit(1)
  }
  
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
  console.log(`验证码: ${verificationCode}\n`)
  
  try {
    console.log('📤 正在通过 Supabase 发送邮件...')
    const result = await sendVerificationEmail(TEST_EMAIL, verificationCode, TEST_NAME)
    
    console.log('\n📋 Supabase 邮件发送结果:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('\n✅ Supabase 邮件发送成功!')
      console.log(`邮件 ID: ${result.messageId}`)
      console.log(`详情: ${result.details}`)
      if (result.note) {
        console.log(`注意: ${result.note}`)
      }
      if (result.actionLink) {
        console.log(`验证链接: ${result.actionLink}`)
      }
      
      console.log('\n📬 请检查以下位置:')
      console.log('  1. Gmail 收件箱')
      console.log('  2. 垃圾邮件文件夹 ⭐ (最重要!)')
      console.log('  3. 促销内容标签')
      console.log('\n⏱️  邮件通常在 1-5 分钟内到达')
      console.log('📧 邮件主题: "验证您的 Citea 账号"')
      console.log('🔍 搜索关键词: "Citea" 或 "验证"')
      
    } else {
      console.error('\n❌ Supabase 邮件发送失败!')
      console.error(`错误: ${result.error}`)
      console.error(`详情: ${result.details}`)
      
      if (result.error?.includes('Invalid API key')) {
        console.error('\n💡 可能原因: SUPABASE_SERVICE_ROLE_KEY 无效')
        console.error('解决方案:')
        console.error('  1. 检查 Supabase Dashboard 中的 Service Role Key')
        console.error('  2. 重新生成 Service Role Key（如果需要）')
        console.error('  3. 更新 .env.local 文件')
        console.error('  4. 参考 CREATE_NEW_SUPABASE_PROJECT.md 创建新项目')
      } else if (result.error?.includes('fetch failed')) {
        console.error('\n💡 网络连接失败')
        console.error('解决方案:')
        console.error('  1. 检查网络连接')
        console.error('  2. 确认 Supabase 项目是否存在')
        console.error('  3. 可能需要创建新的 Supabase 项目')
      }
    }
    
    return result
  } catch (error) {
    console.error('\n❌ 测试失败!')
    console.error(`错误: ${error.message}`)
    console.error(`堆栈: ${error.stack}`)
    return { success: false, error: error.message }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testSupabaseEmail().then(() => {
    console.log('\n🎯 测试完成')
    process.exit(0)
  }).catch(error => {
    console.error('测试异常:', error)
    process.exit(1)
  })
}

module.exports = { testSupabaseEmail }