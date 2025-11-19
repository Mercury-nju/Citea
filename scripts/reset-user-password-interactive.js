#!/usr/bin/env node

/**
 * 交互式重置用户密码
 * 让用户输入新密码
 */

const Redis = require('ioredis')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const TEST_EMAIL = 'lihongyangnju@gmail.com'

// 加载环境变量
const fs = require('fs')
const path = require('path')
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function resetPassword() {
  console.log('🔐 重置用户密码\n')
  console.log('邮箱:', TEST_EMAIL)
  console.log()
  
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
  } catch (error) {
    console.error('❌ Redis 连接失败:', error.message)
    process.exit(1)
  }
  
  const key = `user:${TEST_EMAIL.toLowerCase()}`
  const exists = await redis.exists(key)
  
  if (!exists) {
    console.log('❌ 用户不存在')
    await redis.quit()
    rl.close()
    process.exit(1)
  }
  
  console.log('✅ 找到用户账号\n')
  
  // 获取新密码
  const newPassword = await question('请输入新密码: ')
  
  if (!newPassword || newPassword.length < 6) {
    console.error('❌ 密码至少需要6个字符')
    await redis.quit()
    rl.close()
    process.exit(1)
  }
  
  const confirmPassword = await question('请再次输入密码确认: ')
  
  if (newPassword !== confirmPassword) {
    console.error('❌ 两次输入的密码不一致')
    await redis.quit()
    rl.close()
    process.exit(1)
  }
  
  // 生成密码hash
  const passwordHash = await bcrypt.hash(newPassword, 10)
  
  // 更新密码
  await redis.hset(key, {
    passwordHash: passwordHash,
    emailVerified: 'true' // 同时设置为已验证
  })
  
  console.log()
  console.log('✅ 密码重置成功！')
  console.log('✅ 邮箱验证状态已设置为已验证')
  console.log()
  console.log('📋 登录信息:')
  console.log('   邮箱:', TEST_EMAIL)
  console.log('   密码:', newPassword)
  console.log()
  console.log('💡 现在可以使用这个密码登录了！')
  
  await redis.quit()
  rl.close()
}

resetPassword().catch(error => {
  console.error('❌ 重置失败:', error.message)
  rl.close()
  process.exit(1)
})

