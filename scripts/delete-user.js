#!/usr/bin/env node

/**
 * 删除测试用户
 * 
 * 使用方法:
 *   node scripts/delete-user.js your@email.com
 *   node scripts/delete-user.js --list  (列出所有用户)
 */

const Redis = require('ioredis')
const fs = require('fs')
const path = require('path')

// 手动读取 .env.local
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

if (!process.env.REDIS_URL) {
  console.error('❌ 未设置 REDIS_URL 环境变量')
  process.exit(1)
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null
    return Math.min(times * 50, 2000)
  }
})

async function listUsers() {
  console.log('📋 正在列出所有用户...\n')
  
  try {
    const keys = await redis.keys('user:*')
    
    if (keys.length === 0) {
      console.log('没有找到任何用户')
      return
    }
    
    console.log(`找到 ${keys.length} 个用户:\n`)
    
    for (const key of keys) {
      const userData = await redis.hgetall(key)
      console.log('---')
      console.log('邮箱:', userData.email)
      console.log('姓名:', userData.name)
      console.log('已验证:', userData.emailVerified === 'true' ? '✅' : '❌')
      console.log('创建时间:', userData.createdAt)
      console.log()
    }
  } catch (error) {
    console.error('❌ 列出用户失败:', error.message)
    process.exit(1)
  }
}

async function deleteUser(email) {
  console.log(`🗑️  正在删除用户: ${email}\n`)
  
  try {
    const key = `user:${email.toLowerCase()}`
    const exists = await redis.exists(key)
    
    if (!exists) {
      console.log('❌ 用户不存在')
      return
    }
    
    // 先显示用户信息
    const userData = await redis.hgetall(key)
    console.log('用户信息:')
    console.log('- 邮箱:', userData.email)
    console.log('- 姓名:', userData.name)
    console.log('- 已验证:', userData.emailVerified === 'true' ? '✅' : '❌')
    console.log()
    
    // 删除用户
    await redis.del(key)
    console.log('✅ 用户已删除')
  } catch (error) {
    console.error('❌ 删除失败:', error.message)
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ 请提供邮箱地址或使用 --list 参数')
    console.log('\n使用方法:')
    console.log('  node scripts/delete-user.js your@email.com')
    console.log('  node scripts/delete-user.js --list')
    process.exit(1)
  }
  
  const command = args[0]
  
  if (command === '--list' || command === '-l') {
    await listUsers()
  } else {
    await deleteUser(command)
  }
  
  await redis.quit()
  process.exit(0)
}

redis.on('error', (err) => {
  console.error('❌ Redis 连接错误:', err.message)
  process.exit(1)
})

redis.on('connect', () => {
  console.log('✅ Redis 已连接\n')
  main()
})

