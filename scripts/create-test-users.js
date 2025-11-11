#!/usr/bin/env node

/**
 * 创建测试用户数据
 * 用于测试管理员后台功能
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

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

async function createTestUsers() {
  console.log('🧪 创建测试用户数据...\n')

  const testUsers = [
    {
      email: 'test1@example.com',
      name: '测试用户1',
      plan: 'free',
      emailVerified: true,
      credits: 3,
    },
    {
      email: 'test2@example.com',
      name: '测试用户2',
      plan: 'monthly',
      emailVerified: true,
      credits: 100,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
    },
    {
      email: 'test3@example.com',
      name: '测试用户3',
      plan: 'yearly',
      emailVerified: false,
      credits: 500,
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1年后
    },
  ]

  const Redis = require('ioredis')
  let redis = null

  // 检查存储类型
  if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis://')) {
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

      // 创建测试用户
      for (const userData of testUsers) {
        const userId = crypto.randomUUID()
        const key = `user:${userData.email.toLowerCase()}`
        
        const user = {
          id: userId,
          name: userData.name,
          email: userData.email,
          plan: userData.plan,
          passwordHash: '$2a$10$dummy.hash.for.testing.purposes.only', // 测试用的假哈希
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          emailVerified: userData.emailVerified ? 'true' : 'false',
          verificationCode: '',
          verificationExpiry: '',
          credits: userData.credits.toString(),
          creditsResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          subscriptionExpiresAt: userData.subscriptionExpiresAt || '',
          authProvider: 'email',
          googleId: '',
          avatar: '',
        }

        await redis.hset(key, user)
        console.log(`✅ 创建用户: ${userData.email} (${userData.name})`)
      }

      await redis.quit()
      console.log('\n✅ 测试用户创建完成')
      console.log(`   共创建 ${testUsers.length} 个用户`)
      console.log('\n💡 提示:')
      console.log('   - 这些是测试用户，密码哈希是假的')
      console.log('   - 无法用于实际登录')
      console.log('   - 仅用于测试管理员后台显示功能')
    } catch (error) {
      console.error('❌ Redis 错误:', error.message)
      process.exit(1)
    }
  } else if (process.env.KV_REST_API_URL) {
    try {
      const kv = require('@vercel/kv')
      console.log('✅ Vercel KV 连接成功\n')

      const userIndex = []

      // 创建测试用户
      for (const userData of testUsers) {
        const userId = crypto.randomUUID()
        
        const user = {
          id: userId,
          name: userData.name,
          email: userData.email,
          plan: userData.plan,
          passwordHash: '$2a$10$dummy.hash.for.testing.purposes.only',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          emailVerified: userData.emailVerified,
          verificationCode: '',
          verificationExpiry: '',
          credits: userData.credits,
          creditsResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          subscriptionExpiresAt: userData.subscriptionExpiresAt || '',
          authProvider: 'email',
          googleId: '',
          avatar: '',
        }

        await kv.hset(`user:${userData.email.toLowerCase()}`, user)
        userIndex.push(userData.email.toLowerCase())
        console.log(`✅ 创建用户: ${userData.email} (${userData.name})`)
      }

      // 更新用户索引
      const existingIndex = await kv.get('users:index') || []
      const updatedIndex = [...new Set([...existingIndex, ...userIndex])]
      await kv.set('users:index', updatedIndex)

      console.log('\n✅ 测试用户创建完成')
      console.log(`   共创建 ${testUsers.length} 个用户`)
      console.log('\n💡 提示:')
      console.log('   - 这些是测试用户，密码哈希是假的')
      console.log('   - 无法用于实际登录')
      console.log('   - 仅用于测试管理员后台显示功能')
    } catch (error) {
      console.error('❌ KV 错误:', error.message)
      process.exit(1)
    }
  } else {
    // 文件存储
    try {
      const DATA_DIR = path.join(process.cwd(), 'data')
      const USERS_FILE = path.join(DATA_DIR, 'users.json')

      // 确保目录存在
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      // 读取现有用户
      let users = []
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf8')
        const json = JSON.parse(raw || '{"users":[]}')
        users = json.users || []
      }

      // 添加测试用户
      for (const userData of testUsers) {
        const userId = crypto.randomUUID()
        
        const user = {
          id: userId,
          name: userData.name,
          email: userData.email,
          plan: userData.plan,
          passwordHash: '$2a$10$dummy.hash.for.testing.purposes.only',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          emailVerified: userData.emailVerified,
          verificationCode: '',
          verificationExpiry: '',
          credits: userData.credits,
          creditsResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          subscriptionExpiresAt: userData.subscriptionExpiresAt || '',
          authProvider: 'email',
          googleId: '',
          avatar: '',
        }

        // 检查是否已存在
        const existingIndex = users.findIndex(u => u.email.toLowerCase() === userData.email.toLowerCase())
        if (existingIndex >= 0) {
          users[existingIndex] = user
          console.log(`🔄 更新用户: ${userData.email} (${userData.name})`)
        } else {
          users.push(user)
          console.log(`✅ 创建用户: ${userData.email} (${userData.name})`)
        }
      }

      // 保存到文件
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf8')

      console.log('\n✅ 测试用户创建完成')
      console.log(`   共 ${users.length} 个用户`)
      console.log('\n💡 提示:')
      console.log('   - 这些是测试用户，密码哈希是假的')
      console.log('   - 无法用于实际登录')
      console.log('   - 仅用于测试管理员后台显示功能')
    } catch (error) {
      console.error('❌ 文件存储错误:', error.message)
      process.exit(1)
    }
  }
}

createTestUsers().catch(console.error)






