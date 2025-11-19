#!/usr/bin/env node

/**
 * 测试 Supabase Magic Link 邮件发送
 * 用于验证用户注册邮件是否能正常发送
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

async function testSupabaseMagicLink() {
  console.log('🧪 测试 Supabase Magic Link 邮件发送...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase 配置不完整:')
    console.error('- SUPABASE_URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置')
    console.error('- SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ 已配置' : '❌ 未配置')
    return
  }

  console.log('📋 当前配置:')
  console.log('- Supabase URL:', supabaseUrl)
  console.log('- Service Key:', supabaseServiceKey.substring(0, 20) + '...')

  try {
    // 创建 Supabase 管理员客户端
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 测试邮箱
    const testEmail = '66597405@qq.com'
    
    console.log(`📧 为邮箱 ${testEmail} 生成 Magic Link...`)
    
    // 生成 Magic Link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      email: testEmail,
      type: 'magiclink'
    })

    if (error) {
      console.error('❌ Magic Link 生成失败:', error)
      console.error('错误详情:', error.message)
      console.error('错误代码:', error.code)
      return
    }

    console.log('✅ Magic Link 生成成功!')
    console.log('📊 返回数据:')
    console.log('- Action Link:', data.properties?.action_link)
    console.log('- 验证令牌:', data.properties?.hashed_token?.substring(0, 20) + '...')
    
    // 检查用户是否已存在
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified')
      .eq('email', testEmail)
      .single()

    if (userError) {
      console.log('ℹ️ 用户不存在，将创建新用户')
    } else {
      console.log('ℹ️ 用户已存在:')
      console.log('- 用户ID:', userData.id)
      console.log('- 邮箱验证状态:', userData.email_verified)
    }

    console.log('\n📮 重要说明:')
    console.log('1. Supabase 会自动发送包含 Magic Link 的邮件')
    console.log('2. 用户点击邮件中的链接即可完成验证')
    console.log('3. 请检查邮箱收件箱和垃圾邮件文件夹')
    console.log('4. Magic Link 有效期通常为 1 小时')
    console.log('\n🔗 Magic Link (测试用):', data.properties?.action_link)
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    console.error('错误详情:', error instanceof Error ? error.message : error)
  }
}

// 运行测试
testSupabaseMagicLink().catch(console.error)