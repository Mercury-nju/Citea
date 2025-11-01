#!/usr/bin/env node

/**
 * 直接测试注册流程，这会触发真实的邮件发送
 */

const TEST_EMAIL = 'lihongyangnju@gmail.com'
const TEST_NAME = 'Test User'
const TEST_PASSWORD = 'TestPassword123!'
const PRODUCTION_URL = 'https://citea-2fuwy93mi-mercury-njus-projects.vercel.app'

async function testRegistration() {
  console.log('🧪 测试注册和邮件发送功能\n')
  console.log(`📧 测试邮箱: ${TEST_EMAIL}`)
  console.log(`🌐 生产地址: ${PRODUCTION_URL}\n`)

  // 1. 先清理旧账号（如果存在）
  console.log('1️⃣ 清理旧数据...')
  const Redis = require('ioredis')
  const fs = require('fs')
  const path = require('path')
  
  // 加载环境变量
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
  
  console.log('\n2️⃣ 测试注册（会触发邮件发送）...')
  console.log('   📤 正在发送注册请求...\n')
  
  try {
    const res = await fetch(`${PRODUCTION_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    })
    
    // 检查响应类型
    const contentType = res.headers.get('content-type') || ''
    let data
    
    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      const text = await res.text()
      console.error(`   ❌ 服务器返回了非 JSON 响应 (状态码: ${res.status})`)
      console.error(`   响应预览: ${text.substring(0, 300)}...`)
      throw new Error('服务器响应格式错误')
    }
    
    if (res.ok) {
      if (data.needsVerification) {
        console.log('   ✅ 注册成功!')
        console.log(`   用户 ID: ${data.user?.id || 'N/A'}`)
        console.log(`   邮箱: ${data.user?.email}`)
        console.log(`   姓名: ${data.user?.name}`)
        console.log('\n   📧 验证邮件应该已发送')
        console.log(`   收件邮箱: ${TEST_EMAIL}`)
        console.log('\n   📬 请检查以下位置:')
        console.log('     1. Gmail 收件箱')
        console.log('     2. 垃圾邮件文件夹 ⭐ (最重要!)')
        console.log('     3. 促销内容标签')
        console.log('\n   ⏱️  邮件通常在 1-5 分钟内到达')
        console.log('   📧 邮件主题: "验证您的 Citea 账号"')
        console.log('   🔍 搜索关键词: "Citea" 或 "验证码"')
        
        if (data.emailError) {
          console.log('\n   ⚠️  警告: 邮件发送可能失败')
          console.log(`   错误: ${data.emailErrorDetails || data.message}`)
        }
        
        return { success: true, message: '注册成功，请检查邮箱' }
      } else {
        console.log('   ✅ 注册成功（但未触发验证流程）')
        return { success: true, message: '注册成功' }
      }
    } else {
      console.error('   ❌ 注册失败!')
      console.error(`   错误: ${data.error || data.message || 'Unknown error'}`)
      
      if (data.details) {
        console.error('   详细信息:', data.details)
      }
      
      // 处理特定错误
      if (data.error === 'Email already registered') {
        console.log('\n   💡 提示: 该邮箱已注册')
        console.log('   解决方案: 使用 delete-user.js 脚本删除旧账号')
      }
      
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('   ❌ 请求失败!')
    console.error(`   错误: ${error.message}`)
    
    if (error.message.includes('fetch failed')) {
      console.error('\n   💡 可能原因: 网络连接失败或服务不可用')
      console.error('   请检查:')
      console.error('     1. Vercel 部署是否完成')
      console.error('     2. 网络连接是否正常')
      console.error('     3. 生产地址是否正确')
    }
    
    return { success: false, error: error.message }
  }
}

async function main() {
  try {
    const result = await testRegistration()
    
    console.log('\n' + '='.repeat(50))
    if (result.success) {
      console.log('✅ 测试完成')
      console.log('📧 请检查邮箱确认是否收到验证码')
      console.log('\n💡 重要提示:')
      console.log('   - 如果没收到，优先检查垃圾邮件文件夹')
      console.log('   - Gmail 可能会把邮件放到"促销内容"标签')
      console.log('   - 邮件可能需要几分钟才能到达')
      console.log('\n📝 验证码输入:')
      console.log('   访问验证页面输入收到的 6 位验证码')
      console.log(`   或使用: ${PRODUCTION_URL}/auth/verify-email?email=${encodeURIComponent(TEST_EMAIL)}`)
    } else {
      console.log('❌ 测试失败 - 请查看上方错误信息')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ 测试异常:', error.message)
    process.exit(1)
  }
}

main()

