#!/usr/bin/env node

/**
 * 验证密码是否正确设置
 */

const Redis = require('ioredis')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const TEST_EMAIL = 'lihongyangnju@gmail.com'
const NEW_PASSWORD = 'Lhy321.+'

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

async function verifyPassword() {
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
  const user = await redis.hgetall(key)
  
  if (!user || !user.passwordHash) {
    console.error('❌ 用户不存在或密码Hash未设置')
    await redis.quit()
    process.exit(1)
  }
  
  console.log('🔐 验证密码\n')
  console.log('邮箱:', TEST_EMAIL)
  console.log('测试密码:', NEW_PASSWORD)
  console.log()
  
  const match = await bcrypt.compare(NEW_PASSWORD, user.passwordHash)
  
  if (match) {
    console.log('✅ 密码验证成功！')
    console.log('✅ 新密码已正确设置')
    console.log()
    console.log('📋 登录信息:')
    console.log('   邮箱:', TEST_EMAIL)
    console.log('   密码:', NEW_PASSWORD)
    console.log()
    console.log('💡 现在可以使用这个密码登录了！')
  } else {
    console.error('❌ 密码验证失败！')
    console.error('密码可能未正确重置')
    await redis.quit()
    process.exit(1)
  }
  
  await redis.quit()
}

verifyPassword().catch(error => {
  console.error('❌ 验证失败:', error.message)
  process.exit(1)
})

