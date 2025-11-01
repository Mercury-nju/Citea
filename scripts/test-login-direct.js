#!/usr/bin/env node

/**
 * 直接测试登录逻辑（不依赖API）
 * 验证 getUserByEmail 和密码比较功能
 */

const Redis = require('ioredis')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const TEST_EMAIL = 'lihongyangnju@gmail.com'
const TEST_PASSWORD = 'TestPassword123!'

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

async function getUserByEmail(email) {
  const normalizedEmail = email.toLowerCase()
  console.log('🔍 查找用户:', normalizedEmail)
  
  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL 未配置')
    return null
  }
  
  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null
      return Math.min(times * 50, 2000)
    }
  })
  
  try {
    const key = `user:${normalizedEmail}`
    console.log('   查找键:', key)
    
    const data = await redis.hgetall(key)
    console.log('   返回数据字段:', data ? Object.keys(data) : '无数据')
    
    if (!data || Object.keys(data).length === 0 || !data.id) {
      console.log('   ❌ 用户不存在')
      await redis.quit()
      return null
    }
    
    const user = {
      id: data.id,
      name: data.name,
      email: data.email,
      plan: data.plan || 'free',
      passwordHash: data.passwordHash,
      emailVerified: data.emailVerified === 'true' || data.emailVerified === true,
    }
    
    console.log('   ✅ 用户找到')
    console.log('      邮箱:', user.email)
    console.log('      姓名:', user.name)
    console.log('      密码Hash存在:', !!user.passwordHash)
    console.log('      密码Hash长度:', user.passwordHash?.length || 0)
    console.log('      已验证:', user.emailVerified ? '✅' : '❌')
    
    await redis.quit()
    return user
  } catch (error) {
    console.error('   ❌ 查找失败:', error.message)
    await redis.quit()
    return null
  }
}

async function testLogin() {
  console.log('🧪 测试登录逻辑\n')
  console.log('='.repeat(50))
  console.log()
  
  // 1. 查找用户
  console.log('步骤 1: 查找用户')
  const user = await getUserByEmail(TEST_EMAIL)
  console.log()
  
  if (!user) {
    console.error('❌ 用户不存在，无法继续测试')
    process.exit(1)
  }
  
  // 2. 检查密码Hash
  console.log('步骤 2: 检查密码Hash')
  if (!user.passwordHash) {
    console.error('❌ 密码Hash不存在！')
    process.exit(1)
  }
  console.log('   ✅ 密码Hash存在')
  console.log()
  
  // 3. 比较密码
  console.log('步骤 3: 比较密码')
  console.log('   输入密码:', TEST_PASSWORD)
  console.log('   存储Hash:', user.passwordHash.substring(0, 20) + '...')
  
  try {
    const match = await bcrypt.compare(TEST_PASSWORD, user.passwordHash)
    console.log('   比较结果:', match ? '✅ 匹配' : '❌ 不匹配')
    console.log()
    
    if (!match) {
      console.error('❌ 密码不匹配！')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 密码比较失败:', error.message)
    process.exit(1)
  }
  
  // 4. 检查验证状态
  console.log('步骤 4: 检查验证状态')
  if (!user.emailVerified) {
    console.log('   ⚠️  邮箱未验证（但开发模式可以跳过）')
  } else {
    console.log('   ✅ 邮箱已验证')
  }
  console.log()
  
  // 5. 总结
  console.log('='.repeat(50))
  console.log('✅ 登录逻辑测试通过！')
  console.log()
  console.log('📋 登录信息:')
  console.log('   邮箱:', user.email)
  console.log('   姓名:', user.name)
  console.log('   密码:', TEST_PASSWORD)
  console.log('   已验证:', user.emailVerified ? '✅' : '❌')
  console.log()
  console.log('💡 账号已准备好，可以在浏览器中登录了！')
}

testLogin().catch(error => {
  console.error('❌ 测试异常:', error.message)
  console.error(error.stack)
  process.exit(1)
})

