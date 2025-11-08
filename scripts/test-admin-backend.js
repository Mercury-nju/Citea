#!/usr/bin/env node

/**
 * 测试管理员后台功能
 * 
 * 使用方法:
 * node scripts/test-admin-backend.js
 */

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

async function testAdminBackend() {
  console.log('🧪 开始测试管理员后台功能...\n')

  // 1. 检查环境变量
  console.log('📋 步骤 1: 检查环境变量')
  const hasKV = !!process.env.KV_REST_API_URL
  const hasRedis = !!process.env.REDIS_URL
  const hasAdminSecret = !!process.env.ADMIN_JWT_SECRET
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

  console.log(`  KV_REST_API_URL: ${hasKV ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`  REDIS_URL: ${hasRedis ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`  ADMIN_JWT_SECRET: ${hasAdminSecret ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`  ADMIN_PASSWORD: ${hasAdminPassword ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`  ADMIN_EMAILS: ${adminEmails.length > 0 ? `✅ ${adminEmails.join(', ')}` : '❌ 未配置'}`)
  console.log()

  if (!hasKV && !hasRedis) {
    console.log('⚠️  警告: 未配置数据库 (KV 或 Redis)')
    console.log('   管理员后台需要数据库来存储和检索用户数据\n')
  }

  // 2. 测试数据库连接
  console.log('📋 步骤 2: 测试数据库连接')
  let dbConnected = false
  let userCount = 0

  if (hasRedis && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
    try {
      const Redis = require('ioredis')
      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null
          return Math.min(times * 50, 2000)
        },
        lazyConnect: true
      })

      await redis.connect()
      await redis.ping()
      console.log('  ✅ Redis 连接成功')

      const keys = await redis.keys('user:*')
      userCount = keys.length
      console.log(`  ✅ 找到 ${userCount} 个用户`)

      await redis.quit()
      dbConnected = true
    } catch (error) {
      console.log(`  ❌ Redis 连接失败: ${error.message}`)
    }
  } else if (hasKV) {
    try {
      const kv = require('@vercel/kv')
      console.log('  ✅ Vercel KV 已配置')

      // 检查用户索引
      const userIndex = await kv.get('users:index')
      if (userIndex && Array.isArray(userIndex)) {
        userCount = userIndex.length
        console.log(`  ✅ 用户索引存在，包含 ${userCount} 个用户`)
      } else {
        console.log('  ⚠️  用户索引不存在（可能是新安装）')
        userCount = 0
      }
      dbConnected = true
    } catch (error) {
      console.log(`  ❌ KV 连接失败: ${error.message}`)
    }
  } else {
    // 文件存储
    try {
      const fs = require('fs').promises
      const path = require('path')
      const DATA_DIR = path.join(process.cwd(), 'data')
      const USERS_FILE = path.join(DATA_DIR, 'users.json')

      try {
        const raw = await fs.readFile(USERS_FILE, 'utf8')
        const json = JSON.parse(raw || '{"users":[]}')
        userCount = json.users?.length || 0
        console.log(`  ✅ 文件存储: 找到 ${userCount} 个用户`)
        dbConnected = true
      } catch (fileError) {
        if (fileError.code === 'ENOENT') {
          console.log('  ⚠️  用户文件不存在（可能是新安装）')
          userCount = 0
          dbConnected = true
        } else {
          throw fileError
        }
      }
    } catch (error) {
      console.log(`  ❌ 文件存储错误: ${error.message}`)
    }
  }

  console.log()

  // 3. 测试用户数据获取
  console.log('📋 步骤 3: 测试用户数据获取')
  if (dbConnected && userCount > 0) {
    try {
      // 直接读取 Redis 数据，不 require TypeScript 文件
      if (hasRedis && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
        const Redis = require('ioredis')
        const redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) return null
            return Math.min(times * 50, 2000)
          },
          lazyConnect: true
        })
        
        await redis.connect()
        const keys = await redis.keys('user:*')
        
        if (keys.length > 0) {
          const testKey = keys[0]
          const testEmail = testKey.replace('user:', '')
          const userData = await redis.hgetall(testKey)
          
          if (userData && userData.id) {
            console.log(`  ✅ 成功读取用户数据: ${testEmail}`)
            console.log(`     - 姓名: ${userData.name || '未设置'}`)
            console.log(`     - 计划: ${userData.plan || 'free'}`)
            console.log(`     - 已验证: ${userData.emailVerified === 'true' ? '是' : '否'}`)
            console.log(`     - 积分: ${userData.credits || 0}`)
          } else {
            console.log('  ⚠️  用户数据格式不正确')
          }
        } else {
          console.log('  ℹ️  数据库中没有用户')
        }
        await redis.quit()
      } else if (hasKV) {
        const kv = require('@vercel/kv')
        const userIndex = await kv.get('users:index')
        if (userIndex && Array.isArray(userIndex) && userIndex.length > 0) {
          const testEmail = userIndex[0]
          const userData = await kv.hgetall(`user:${testEmail}`)
          if (userData && userData.id) {
            console.log(`  ✅ 成功读取用户数据: ${testEmail}`)
            console.log(`     - 姓名: ${userData.name || '未设置'}`)
            console.log(`     - 计划: ${userData.plan || 'free'}`)
            console.log(`     - 已验证: ${userData.emailVerified ? '是' : '否'}`)
            console.log(`     - 积分: ${userData.credits || 0}`)
          } else {
            console.log('  ⚠️  无法获取用户数据')
          }
        } else {
          console.log('  ℹ️  数据库中没有用户')
        }
      }
    } catch (error) {
      console.log(`  ❌ 测试失败: ${error.message}`)
    }
  } else {
    console.log('  ⚠️  跳过测试（数据库未连接或没有用户）')
  }

  console.log()

  // 4. 总结
  console.log('📊 测试总结')
  console.log('='.repeat(50))
  console.log(`数据库连接: ${dbConnected ? '✅' : '❌'}`)
  console.log(`用户数量: ${userCount}`)
  console.log(`管理员配置: ${hasAdminSecret && hasAdminPassword ? '✅' : '❌'}`)
  console.log()

  if (userCount === 0) {
    console.log('💡 提示:')
    console.log('  - 数据库中暂无用户数据')
    console.log('  - 这是正常的，如果是新安装')
    console.log('  - 管理员后台会显示 0 或空列表')
    console.log('  - 当有用户注册后，数据会自动显示')
    console.log()
  }

  if (!dbConnected) {
    console.log('⚠️  警告:')
    console.log('  - 数据库未连接，管理员后台无法获取数据')
    console.log('  - 请检查 REDIS_URL 或 KV_REST_API_URL 配置')
    console.log()
  }

  console.log('✅ 测试完成')
}

testAdminBackend().catch(console.error)

