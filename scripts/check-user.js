#!/usr/bin/env node

/**
 * 检查用户账号详细信息
 */

const Redis = require('ioredis')
const fs = require('fs')
const path = require('path')

const TEST_EMAIL = 'lihongyangnju@gmail.com'

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

async function checkUser() {
  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL 未配置')
    process.exit(1)
  }
  
  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null
      return Math.min(times * 50, 2000)
    }
  })
  
  try {
    await redis.ping()
    console.log('✅ Redis 连接成功\n')
  } catch (error) {
    console.error('❌ Redis 连接失败:', error.message)
    process.exit(1)
  }
  
  const key = `user:${TEST_EMAIL.toLowerCase()}`
  const exists = await redis.exists(key)
  
  if (!exists) {
    console.log('❌ 用户不存在')
    await redis.quit()
    process.exit(1)
  }
  
  const user = await redis.hgetall(key)
  
  console.log('📋 用户详细信息:')
  console.log('='.repeat(50))
  console.log('邮箱:', user.email)
  console.log('姓名:', user.name)
  console.log('ID:', user.id)
  console.log('方案:', user.plan)
  console.log('创建时间:', user.createdAt)
  console.log('最后登录:', user.lastLoginAt)
  console.log('已验证:', user.emailVerified === 'true' ? '✅' : '❌')
  console.log('验证码:', user.verificationCode || '无')
  console.log('验证码过期:', user.verificationExpiry || '无')
  console.log('密码Hash:', user.passwordHash ? `已设置 (${user.passwordHash.length} 字符)` : '❌ 未设置')
  if (user.passwordHash) {
    console.log('密码Hash预览:', user.passwordHash.substring(0, 30) + '...')
  }
  console.log('='.repeat(50))
  console.log()
  
  // 检查是否是测试脚本创建的
  const createdAt = new Date(user.createdAt || '')
  const now = new Date()
  const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60)
  
  if (hoursSinceCreation < 1) {
    console.log('⚠️  警告：这个账号可能是刚才的测试脚本创建的')
    console.log(`   创建于 ${hoursSinceCreation.toFixed(1)} 小时前`)
    console.log()
  }
  
  if (!user.passwordHash) {
    console.log('❌ 问题：密码Hash不存在！')
    console.log('   这表示注册时密码可能没有正确保存')
  } else {
    console.log('✅ 密码Hash存在')
    console.log('   注意：由于密码已加密，无法查看原始密码')
    console.log('   如果忘记密码，需要使用重置密码功能')
  }
  
  await redis.quit()
}

checkUser().catch(error => {
  console.error('❌ 检查失败:', error.message)
  process.exit(1)
})

