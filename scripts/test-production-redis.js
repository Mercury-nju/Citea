#!/usr/bin/env node

/**
 * 测试生产环境的 Redis 连接和数据读取
 * 这个脚本可以帮助诊断生产环境的问题
 */

console.log('🔍 测试生产环境 Redis 连接...\n')

// 注意：这个脚本需要在生产环境运行，或者使用生产环境的 Redis URL
// 使用方法：
// REDIS_URL=your_production_redis_url node scripts/test-production-redis.js

const Redis = require('ioredis')

async function testProductionRedis() {
  const redisUrl = process.env.REDIS_URL
  
  if (!redisUrl) {
    console.log('❌ REDIS_URL 环境变量未设置')
    console.log('使用方法: REDIS_URL=your_redis_url node scripts/test-production-redis.js')
    process.exit(1)
  }

  console.log('📋 配置信息:')
  console.log(`   Redis URL: ${redisUrl.substring(0, 30)}...`)
  console.log(`   URL 类型: ${redisUrl.startsWith('rediss://') ? 'SSL (rediss://)' : redisUrl.startsWith('redis://') ? 'Standard (redis://)' : 'Unknown'}`)
  console.log()

  try {
    console.log('🔌 连接到 Redis...')
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 50, 2000)
      },
      lazyConnect: false
    })

    // 测试连接
    await redis.ping()
    console.log('✅ Redis 连接成功\n')

    // 获取所有用户键
    console.log('🔍 查找用户键...')
    const keys = await redis.keys('user:*')
    console.log(`✅ 找到 ${keys.length} 个用户键\n`)

    if (keys.length === 0) {
      console.log('⚠️  警告: Redis 中没有找到用户数据')
      console.log('   可能的原因:')
      console.log('   1. 用户数据存储在不同的数据库中')
      console.log('   2. 用户键的格式不是 user:*')
      console.log('   3. Redis 数据库是空的')
      console.log()
      
      // 尝试查找所有键
      console.log('🔍 查找所有键...')
      const allKeys = await redis.keys('*')
      console.log(`   找到 ${allKeys.length} 个键`)
      if (allKeys.length > 0) {
        console.log('   前 10 个键:')
        allKeys.slice(0, 10).forEach(key => {
          console.log(`     - ${key}`)
        })
      }
    } else {
      console.log('📋 用户列表:')
      for (let i = 0; i < Math.min(keys.length, 10); i++) {
        const key = keys[i]
        const email = key.replace('user:', '')
        const userData = await redis.hgetall(key)
        
        if (userData && userData.id && userData.email) {
          console.log(`\n   ${i + 1}. ${userData.name || '未设置'} (${userData.email})`)
          console.log(`      ID: ${userData.id}`)
          console.log(`      计划: ${userData.plan || 'free'}`)
          console.log(`      已验证: ${userData.emailVerified === 'true' ? '是' : '否'}`)
          console.log(`      积分: ${userData.credits || 0}`)
        } else {
          console.log(`\n   ${i + 1}. ${email} (数据不完整)`)
        }
      }
      
      if (keys.length > 10) {
        console.log(`\n   ... 还有 ${keys.length - 10} 个用户`)
      }
    }

    await redis.quit()
    console.log('\n✅ 测试完成')
  } catch (error) {
    console.error('❌ 错误:', error.message)
    console.error('   错误详情:', error)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 可能的原因:')
      console.log('   - Redis 服务器不可访问')
      console.log('   - Redis URL 不正确')
      console.log('   - 网络连接问题')
    } else if (error.message.includes('NOAUTH')) {
      console.log('\n💡 可能的原因:')
      console.log('   - Redis 需要密码认证')
      console.log('   - Redis URL 中的密码不正确')
    } else if (error.message.includes('SSL')) {
      console.log('\n💡 可能的原因:')
      console.log('   - SSL 连接问题')
      console.log('   - 证书验证失败')
    }
    
    process.exit(1)
  }
}

testProductionRedis().catch(console.error)

