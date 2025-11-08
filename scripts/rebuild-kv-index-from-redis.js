#!/usr/bin/env node

/**
 * 从 Redis 用户数据重建 KV 用户索引
 * 这个脚本用于将 Redis 中的用户数据迁移到 KV 索引
 */

const fs = require('fs')
const path = require('path')

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      let value = match[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      process.env[match[1].trim()] = value
    }
  })
}

async function rebuildIndexFromRedis() {
  console.log('🔄 从 Redis 重建 KV 用户索引...\n')

  // 检查 Redis 配置
  if (!process.env.REDIS_URL || (!process.env.REDIS_URL.startsWith('redis://') && !process.env.REDIS_URL.startsWith('rediss://'))) {
    console.log('❌ REDIS_URL 未配置或格式不正确')
    console.log('   需要 Redis URL 来读取用户数据')
    process.exit(1)
  }

  // 检查 KV 配置
  if (!process.env.KV_REST_API_URL) {
    console.log('❌ KV_REST_API_URL 未配置')
    console.log('   需要 Vercel KV 配置来创建索引')
    process.exit(1)
  }

  try {
    // 从 Redis 读取所有用户
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
    console.log('✅ Redis 连接成功\n')

    const keys = await redis.keys('user:*')
    console.log(`📋 找到 ${keys.length} 个用户键\n`)

    if (keys.length === 0) {
      console.log('⚠️  Redis 中没有用户数据')
      await redis.quit()
      process.exit(0)
    }

    // 提取用户邮箱
    const userEmails = keys.map(key => key.replace('user:', '').toLowerCase())
    console.log('📧 用户邮箱列表:')
    userEmails.forEach((email, index) => {
      console.log(`   ${index + 1}. ${email}`)
    })
    console.log()

    // 更新 KV 索引
    const kv = require('@vercel/kv')
    console.log('✅ 连接到 Vercel KV...\n')

    // 获取现有索引
    const existingIndex = await kv.get('users:index') || []
    console.log(`📊 现有索引包含 ${existingIndex.length} 个用户`)

    // 合并并去重
    const updatedIndex = [...new Set([...existingIndex, ...userEmails])]
    console.log(`📊 更新后索引包含 ${updatedIndex.length} 个用户\n`)

    // 保存索引
    await kv.set('users:index', updatedIndex)
    console.log('✅ 用户索引已更新到 KV\n')

    console.log('='.repeat(60))
    console.log('📊 索引更新完成')
    console.log('='.repeat(60))
    console.log(`总用户数: ${updatedIndex.length}`)
    console.log(`新增用户: ${updatedIndex.length - existingIndex.length}`)
    console.log()

    await redis.quit()
    console.log('✅ 完成')
  } catch (error) {
    console.error('❌ 错误:', error.message)
    console.error(error)
    process.exit(1)
  }
}

rebuildIndexFromRedis().catch(console.error)

