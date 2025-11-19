#!/usr/bin/env node

/**
 * 测试 Redis 连接
 * 
 * 使用方法:
 *   node scripts/test-redis.js
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
  console.log('\n请在 .env.local 文件中添加:')
  console.log('REDIS_URL=rediss://default:password@host:port')
  process.exit(1)
}

const redisUrl = process.env.REDIS_URL

console.log('🔄 测试 Redis 连接...')
console.log('URL:', redisUrl.replace(/:[^:@]+@/, ':****@'))
console.log()

// 检查 URL 格式
if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
  console.error('❌ REDIS_URL 格式不正确')
  console.log('期望格式: redis://... 或 rediss://...')
  console.log('当前格式:', redisUrl.split('://')[0] + '://...')
  process.exit(1)
}

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      return null // Stop retrying
    }
    return Math.min(times * 50, 2000)
  }
})

let connected = false

redis.on('connect', () => {
  console.log('✅ Redis 连接成功!')
  connected = true
})

redis.on('error', (err) => {
  console.error('❌ Redis 连接错误:', err.message)
})

async function testRedis() {
  try {
    // 等待连接
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    if (!connected) {
      console.error('❌ 连接超时')
      process.exit(1)
    }

    // 测试写入
    console.log('\n📝 测试写入数据...')
    const testKey = 'test:connection'
    const testValue = 'Redis connection successful at ' + new Date().toISOString()
    await redis.set(testKey, testValue)
    console.log('✅ 写入成功')

    // 测试读取
    console.log('\n📖 测试读取数据...')
    const value = await redis.get(testKey)
    console.log('✅ 读取成功:', value)

    // 测试 hash 操作（用户存储使用的方式）
    console.log('\n📦 测试 Hash 操作...')
    const testHashKey = 'test:user:test@example.com'
    await redis.hset(testHashKey, {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: 'false'
    })
    console.log('✅ Hash 写入成功')

    const hashData = await redis.hgetall(testHashKey)
    console.log('✅ Hash 读取成功:', hashData)

    // 清理测试数据
    console.log('\n🧹 清理测试数据...')
    await redis.del(testKey)
    await redis.del(testHashKey)
    console.log('✅ 清理完成')

    console.log('\n✨ Redis 连接测试全部通过!')
    console.log('\n你的 Redis 配置是正确的，可以用于生产环境。')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await redis.quit()
    process.exit(0)
  }
}

testRedis()

