#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 
 * 功能:
 *   - 测试数据库连接
 *   - 创建测试用户 (可选)
 *   - 验证数据结构
 * 
 * 使用方法:
 *   node scripts/init-database.js
 *   node scripts/init-database.js --create-test-user
 */

const Redis = require('ioredis')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')

// 配置
const REDIS_URL = process.env.REDIS_URL
const CREATE_TEST_USER = process.argv.includes('--create-test-user')

async function testRedisConnection() {
  console.log('📡 测试 Redis 连接...')
  
  if (!REDIS_URL) {
    console.log('⚠️  未配置 REDIS_URL，将使用文件存储')
    return null
  }

  try {
    const redis = new Redis(REDIS_URL)
    await redis.ping()
    console.log('✅ Redis 连接成功\n')
    return redis
  } catch (error) {
    console.error('❌ Redis 连接失败:', error.message)
    return null
  }
}

async function createTestUser(redis) {
  console.log('👤 创建测试用户...')

  const testUser = {
    id: randomUUID(),
    name: 'Test User',
    email: 'test@citea.com',
    passwordHash: await bcrypt.hash('test123456', 10),
    plan: 'free',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  }

  if (redis) {
    // Redis 存储
    const key = `user:${testUser.email.toLowerCase()}`
    const exists = await redis.exists(key)
    
    if (exists) {
      console.log('⚠️  测试用户已存在，跳过创建')
      const user = await redis.hgetall(key)
      console.log('\n现有用户信息:')
      console.log(JSON.stringify(user, null, 2))
    } else {
      await redis.hset(key, testUser)
      console.log('✅ 测试用户创建成功!')
      console.log('\n用户信息:')
      console.log('  Email: test@citea.com')
      console.log('  Password: test123456')
      console.log('  Plan: free')
    }
  } else {
    // 文件存储
    const fs = require('fs').promises
    const path = require('path')
    const dataDir = path.join(process.cwd(), 'data')
    const usersFile = path.join(dataDir, 'users.json')

    try {
      await fs.mkdir(dataDir, { recursive: true })
      
      let usersData = { users: [] }
      try {
        const content = await fs.readFile(usersFile, 'utf8')
        usersData = JSON.parse(content)
      } catch (error) {
        // 文件不存在，使用空数据
      }

      const exists = usersData.users.some(u => u.email === testUser.email)
      if (exists) {
        console.log('⚠️  测试用户已存在，跳过创建')
      } else {
        usersData.users.push(testUser)
        await fs.writeFile(usersFile, JSON.stringify(usersData, null, 2))
        console.log('✅ 测试用户创建成功!')
        console.log('\n用户信息:')
        console.log('  Email: test@citea.com')
        console.log('  Password: test123456')
        console.log('  Plan: free')
      }
    } catch (error) {
      console.error('❌ 创建测试用户失败:', error.message)
    }
  }
  console.log()
}

async function showDatabaseStats(redis) {
  console.log('📊 数据库统计...')

  if (redis) {
    // Redis 统计
    const keys = await redis.keys('user:*')
    console.log(`✅ 用户总数: ${keys.length}`)
    
    if (keys.length > 0) {
      console.log('\n用户列表:')
      for (const key of keys) {
        const user = await redis.hgetall(key)
        console.log(`  - ${user.email} (${user.name}) - ${user.plan}`)
      }
    }
  } else {
    // 文件存储统计
    const fs = require('fs').promises
    const path = require('path')
    const usersFile = path.join(process.cwd(), 'data', 'users.json')

    try {
      const content = await fs.readFile(usersFile, 'utf8')
      const usersData = JSON.parse(content)
      console.log(`✅ 用户总数: ${usersData.users.length}`)
      
      if (usersData.users.length > 0) {
        console.log('\n用户列表:')
        for (const user of usersData.users) {
          console.log(`  - ${user.email} (${user.name}) - ${user.plan}`)
        }
      }
    } catch (error) {
      console.log('⚠️  数据文件不存在或为空')
    }
  }
  console.log()
}

async function checkEnvironment() {
  console.log('🔍 环境检查...\n')

  const checks = [
    {
      name: 'Node.js 版本',
      check: () => {
        const version = process.version
        const major = parseInt(version.slice(1).split('.')[0])
        return major >= 18
      },
      current: process.version,
      required: '18.0.0+'
    },
    {
      name: 'JWT_SECRET',
      check: () => !!process.env.JWT_SECRET && process.env.JWT_SECRET !== 'dev-secret-change-me',
      current: process.env.JWT_SECRET ? '已设置' : '未设置',
      required: '强密钥'
    },
    {
      name: 'NODE_ENV',
      check: () => true,
      current: process.env.NODE_ENV || 'development',
      required: '-'
    },
    {
      name: 'REDIS_URL',
      check: () => true,
      current: REDIS_URL ? '已设置' : '未设置 (使用文件存储)',
      required: '生产环境推荐'
    }
  ]

  for (const { name, check, current, required } of checks) {
    const passed = check()
    const status = passed ? '✅' : '⚠️ '
    console.log(`${status} ${name}: ${current} (需要: ${required})`)
  }
  console.log()
}

async function main() {
  console.log('🚀 Citea 数据库初始化\n')
  console.log('='.repeat(50))
  console.log()

  // 环境检查
  await checkEnvironment()

  // 测试连接
  const redis = await testRedisConnection()

  // 创建测试用户
  if (CREATE_TEST_USER) {
    await createTestUser(redis)
  }

  // 显示统计
  await showDatabaseStats(redis)

  // 关闭连接
  if (redis) {
    await redis.quit()
  }

  console.log('='.repeat(50))
  console.log('✅ 初始化完成!\n')

  if (!CREATE_TEST_USER) {
    console.log('提示: 使用 --create-test-user 参数创建测试用户')
    console.log('  node scripts/init-database.js --create-test-user\n')
  }
}

main().catch(error => {
  console.error('❌ 发生错误:', error)
  process.exit(1)
})

