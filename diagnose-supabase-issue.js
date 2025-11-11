#!/usr/bin/env node

/**
 * Supabase 问题诊断脚本
 * 检查 API 密钥有效性和邮件配置
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

async function diagnoseSupabaseIssue() {
  console.log('🔍 诊断 Supabase 配置问题...\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('📋 环境变量检查:')
  console.log('- SUPABASE_URL:', supabaseUrl ? '✅ 已设置' : '❌ 未设置')
  console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 已设置' : '❌ 未设置')
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ 已设置' : '❌ 未设置')
  
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('\n❌ 环境变量配置不完整')
    return
  }

  console.log('\n🔑 密钥格式检查:')
  console.log('- ANON_KEY 长度:', supabaseAnonKey.length)
  console.log('- SERVICE_KEY 长度:', supabaseServiceKey.length)
  
  // 检查密钥格式（JWT）
  const checkJWT = (key, name) => {
    try {
      const parts = key.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        console.log(`- ${name} JWT 格式: ✅ 有效`)
        console.log(`- ${name} 角色:`, payload.role || '未知')
        console.log(`- ${name} 过期时间:`, payload.exp ? new Date(payload.exp * 1000).toISOString() : '未知')
        return true
      } else {
        console.log(`- ${name} JWT 格式: ❌ 无效 (应该是3部分，实际${parts.length}部分)`)
        return false
      }
    } catch (error) {
      console.log(`- ${name} JWT 格式: ❌ 解析失败`, error.message)
      return false
    }
  }
  
  const anonValid = checkJWT(supabaseAnonKey, 'ANON_KEY')
  const serviceValid = checkJWT(supabaseServiceKey, 'SERVICE_KEY')

  console.log('\n🌐 连接测试:')
  
  try {
    // 测试匿名客户端
    console.log('1. 测试匿名客户端...')
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: anonData, error: anonError } = await anonClient
      .from('users')
      .select('id')
      .limit(1)
    
    if (anonError) {
      console.log('   ❌ 匿名客户端错误:', anonError.message)
    } else {
      console.log('   ✅ 匿名客户端连接成功')
    }
    
    // 测试服务角色客户端
    console.log('2. 测试服务角色客户端...')
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('users')
      .select('id')
      .limit(1)
    
    if (serviceError) {
      console.log('   ❌ 服务角色客户端错误:', serviceError.message)
    } else {
      console.log('   ✅ 服务角色客户端连接成功')
    }
    
    // 测试用户管理功能
    console.log('3. 测试用户管理功能...')
    try {
      const { data: users, error: userError } = await serviceClient.auth.admin.listUsers()
      if (userError) {
        console.log('   ❌ 用户管理错误:', userError.message)
      } else {
        console.log('   ✅ 用户管理功能正常')
      }
    } catch (authError) {
      console.log('   ❌ 用户管理错误:', authError.message)
    }
    
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message)
  }

  console.log('\n📧 邮件配置检查:')
  console.log('- 项目URL:', supabaseUrl)
  console.log('- 请确保在项目设置中启用了邮件服务')
  console.log('- 检查 SMTP 配置或使用 Supabase 默认邮件服务')
  
  console.log('\n💡 建议:')
  console.log('1. 访问 Supabase 控制台确认 API 密钥')
  console.log('2. 检查项目设置中的邮件配置')
  console.log('3. 确保服务角色密钥有管理员权限')
  console.log('4. 如果使用自定义 SMTP，请验证 SMTP 配置')
  
  console.log('\n🔗 相关链接:')
  console.log('- Supabase 控制台: https://supabase.com/dashboard')
  console.log('- API 设置: https://supabase.com/dashboard/project/_/settings/api')
  console.log('- 邮件设置: https://supabase.com/dashboard/project/_/auth/emails')
}

// 运行诊断
diagnoseSupabaseIssue().catch(console.error)