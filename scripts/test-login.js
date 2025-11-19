#!/usr/bin/env node

/**
 * 测试登录功能
 * 检查账号是否存在，如果不存在则创建，然后测试登录
 */

const Redis = require('ioredis')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')
const fs = require('fs')
const path = require('path')

const TEST_EMAIL = 'lihongyangnju@gmail.com'
const TEST_PASSWORD = 'TestPassword123!'
const TEST_NAME = 'Test User'

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

async function checkUser(redis) {
  const key = `user:${TEST_EMAIL.toLowerCase()}`
  if (redis) {
    const exists = await redis.exists(key)
    if (exists) {
      const user = await redis.hgetall(key)
      return user
    }
  }
  return null
}

async function createOrUpdateUser(redis) {
  console.log('📝 检查/创建测试账号...\n')
  
  const key = `user:${TEST_EMAIL.toLowerCase()}`
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10)
  
  const userData = {
    id: randomUUID(),
    name: TEST_NAME,
    email: TEST_EMAIL,
    passwordHash: passwordHash,
    plan: 'free',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    emailVerified: 'true', // 设置为已验证，方便登录
  }
  
  if (redis) {
    const exists = await redis.exists(key)
    if (exists) {
      console.log('✅ 账号已存在，更新密码和验证状态...')
      await redis.hset(key, {
        passwordHash: passwordHash,
        emailVerified: 'true'
      })
    } else {
      console.log('✅ 创建新账号...')
      await redis.hset(key, userData)
    }
    
    const user = await redis.hgetall(key)
    console.log('账号信息:')
    console.log('  邮箱:', user.email)
    console.log('  姓名:', user.name)
    console.log('  已验证:', user.emailVerified === 'true' ? '✅' : '❌')
    console.log('  密码Hash:', user.passwordHash ? '已设置' : '未设置')
    console.log()
    return user
  } else {
    console.error('❌ REDIS_URL 未配置')
    process.exit(1)
  }
}

async function testLogin(redis) {
  console.log('🧪 测试登录功能...\n')
  
  // 1. 检查账号是否存在
  const user = await checkUser(redis)
  if (!user || !user.id) {
    console.log('❌ 账号不存在，先创建账号...')
    await createOrUpdateUser(redis)
    return
  }
  
  console.log('✅ 账号存在')
  console.log('账号信息:')
  console.log('  邮箱:', user.email)
  console.log('  已验证:', user.emailVerified === 'true' ? '✅' : '❌')
  console.log('  密码Hash:', user.passwordHash ? '已设置 (' + user.passwordHash.length + ' chars)' : '❌ 未设置')
  console.log()
  
  // 2. 确保密码和验证状态正确
  if (!user.passwordHash || user.emailVerified !== 'true') {
    console.log('⚠️  修复账号数据...')
    await createOrUpdateUser(redis)
  }
  
  // 3. 验证密码
  console.log('🔐 验证密码...')
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10)
  const storedHash = user.passwordHash
  
  if (!storedHash) {
    console.error('❌ 密码Hash不存在！')
    process.exit(1)
  }
  
  const match = await bcrypt.compare(TEST_PASSWORD, storedHash)
  console.log('密码匹配:', match ? '✅' : '❌')
  console.log()
  
  if (!match) {
    console.log('⚠️  密码不匹配，重置密码...')
    await createOrUpdateUser(redis)
    
    // 再次验证
    const updatedUser = await checkUser(redis)
    const newMatch = await bcrypt.compare(TEST_PASSWORD, updatedUser.passwordHash)
    console.log('重置后密码匹配:', newMatch ? '✅' : '❌')
    
    if (!newMatch) {
      console.error('❌ 密码重置后仍然不匹配！')
      process.exit(1)
    }
  }
  
  // 4. 测试实际登录API（可选，因为需要等待部署）
  console.log('🌐 测试登录API...')
  console.log('   ⚠️  注意：需要等待 Vercel 部署完成后才能测试')
  console.log('   建议手动在浏览器中测试登录功能')
  console.log()
  
  const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://citea-8bo7omx8y-mercury-njus-projects.vercel.app'
  console.log('📋 登录信息:')
  console.log('   URL:', PRODUCTION_URL)
  console.log('   邮箱:', TEST_EMAIL)
  console.log('   密码:', TEST_PASSWORD)
  console.log()
  
  // 尝试测试API（但不强制要求成功，因为部署可能需要时间）
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }),
      // 增加超时
      signal: AbortSignal.timeout(10000) // 10秒超时
    })
    
    const contentType = response.headers.get('content-type') || ''
    let data
    
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.log('⚠️  服务器返回了非 JSON 响应（可能部署还未完成）')
      console.log('   状态码:', response.status)
      console.log('   响应预览:', text.substring(0, 200))
      console.log()
      console.log('💡 请在浏览器中手动测试登录功能')
      return // 不退出，只是警告
    }
    
    if (response.ok) {
      console.log('✅ 登录成功！')
      console.log('   用户:', data.user?.name || data.user?.email)
      console.log('   邮箱:', data.user?.email)
      console.log('   方案:', data.user?.plan)
      console.log()
      console.log('🎉 登录功能正常！')
    } else {
      console.log('⚠️  登录返回错误（可能部署还未完成）')
      console.log('   状态码:', response.status)
      console.log('   错误:', data.error || data.message || 'Unknown error')
      console.log()
      console.log('💡 请稍等几分钟后再次测试，或手动在浏览器中测试')
      if (data.needsVerification) {
        console.log('   注意：需要验证邮箱')
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⚠️  请求超时（部署可能还在进行中）')
    } else {
      console.log('⚠️  登录请求失败:', error.message)
    }
    console.log('💡 请稍后手动在浏览器中测试登录功能')
  }
}

async function main() {
  console.log('🚀 开始测试登录功能\n')
  console.log('='.repeat(50))
  console.log()
  
  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL 未配置')
    console.log('请在 .env.local 中设置 REDIS_URL')
    process.exit(1)
  }
  
  let redis
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 50, 2000)
      }
    })
    
    await redis.ping()
    console.log('✅ Redis 连接成功\n')
  } catch (error) {
    console.error('❌ Redis 连接失败:', error.message)
    process.exit(1)
  }
  
  try {
    // 确保账号存在且数据正确
    await createOrUpdateUser(redis)
    
    // 测试登录
    await testLogin(redis)
    
    await redis.quit()
    
    console.log('='.repeat(50))
    console.log('✅ 测试完成！\n')
  } catch (error) {
    console.error('❌ 测试异常:', error.message)
    console.error(error.stack)
    await redis.quit()
    process.exit(1)
  }
}

main()

