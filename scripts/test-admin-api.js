#!/usr/bin/env node

/**
 * 直接测试管理员 API 的数据读取逻辑
 * 模拟管理员 API 的代码路径
 */

const fs = require('fs')
const path = require('path')

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    // 跳过注释和空行
    if (line.trim().startsWith('#') || !line.trim()) return
    
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      let value = match[2].trim()
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      process.env[match[1].trim()] = value
    }
  })
}

// 调试：显示 REDIS_URL 是否加载
console.log('🔍 环境变量检查:')
console.log(`   REDIS_URL 存在: ${!!process.env.REDIS_URL}`)
if (process.env.REDIS_URL) {
  console.log(`   REDIS_URL 长度: ${process.env.REDIS_URL.length}`)
  console.log(`   REDIS_URL 前缀: ${process.env.REDIS_URL.substring(0, 20)}...`)
}
console.log()

async function testAdminAPI() {
  console.log('🧪 测试管理员 API 数据读取逻辑...\n')

  // 模拟管理员 API 的代码
  const users = []
  const Redis = require('ioredis')

  // Redis 存储
  if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
    try {
      console.log('📦 使用 Redis 存储')
      console.log(`   REDIS_URL: ${process.env.REDIS_URL.substring(0, 30)}...\n`)

      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null
          return Math.min(times * 50, 2000)
        }
      })

      await redis.ping()
      console.log('✅ Redis 连接成功\n')

      // 获取所有用户键
      const keys = await redis.keys('user:*')
      console.log(`🔍 找到 ${keys.length} 个用户键\n`)

      // 导入 userStore
      const userStorePath = path.join(__dirname, '..', 'lib', 'userStore.ts')
      console.log('📝 测试 getUserByEmail 函数...\n')

      // 直接读取 Redis 数据（模拟 API 逻辑）
      for (const key of keys) {
        const email = key.replace('user:', '')
        console.log(`  处理用户: ${email}`)

        // 直接从 Redis 读取
        const userData = await redis.hgetall(key)
        console.log(`    - 数据键: ${Object.keys(userData).length} 个字段`)
        console.log(`    - 是否有 id: ${!!userData.id}`)
        console.log(`    - 是否有 email: ${!!userData.email}`)
        console.log(`    - 是否有 name: ${!!userData.name}`)

        if (userData && userData.id) {
          users.push({
            id: userData.id || userData.email,
            email: userData.email,
            name: userData.name || '未设置',
            plan: userData.plan || 'free',
            emailVerified: userData.emailVerified === 'true' || userData.emailVerified === true,
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLoginAt: userData.lastLoginAt,
            credits: userData.credits ? parseInt(userData.credits, 10) : 0,
            subscriptionExpiresAt: userData.subscriptionExpiresAt,
            hasActiveSubscription: userData.subscriptionExpiresAt && new Date(userData.subscriptionExpiresAt) > new Date()
          })
          console.log(`    ✅ 用户数据已添加`)
        } else {
          console.log(`    ❌ 用户数据无效（缺少 id）`)
        }
        console.log()
      }

      await redis.quit()
    } catch (error) {
      console.error('❌ Redis 错误:', error.message)
      console.error(error)
      process.exit(1)
    }
  } else {
    console.log('❌ REDIS_URL 未配置或格式不正确')
    process.exit(1)
  }

  console.log('='.repeat(60))
  console.log('📊 测试结果')
  console.log('='.repeat(60))
  console.log(`成功读取用户数: ${users.length}`)
  console.log()

  if (users.length > 0) {
    console.log('📋 读取到的用户:')
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   计划: ${user.plan}`)
      console.log(`   已验证: ${user.emailVerified ? '✅' : '❌'}`)
      console.log(`   积分: ${user.credits}`)
    })
  } else {
    console.log('❌ 没有读取到任何用户数据')
    console.log('\n可能的原因:')
    console.log('1. getUserByEmail 函数有问题')
    console.log('2. 用户数据格式不正确')
    console.log('3. Redis 数据读取有问题')
  }

  console.log('\n' + '='.repeat(60))
}

testAdminAPI().catch(error => {
  console.error('❌ 测试失败:', error.message)
  console.error(error)
  process.exit(1)
})

