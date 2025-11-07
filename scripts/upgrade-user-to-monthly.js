#!/usr/bin/env node

/**
 * 将用户升级为月费会员
 * 用法: node scripts/upgrade-user-to-monthly.js <email>
 */

const Redis = require('ioredis')
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

async function upgradeUserToMonthly(email) {
  if (!email) {
    console.error('❌ 请提供邮箱地址')
    console.error('用法: node scripts/upgrade-user-to-monthly.js <email>')
    process.exit(1)
  }

  const normalizedEmail = email.toLowerCase()

  if (!process.env.REDIS_URL && !process.env.KV_REST_API_URL) {
    console.error('❌ 数据库未配置 (需要 REDIS_URL 或 KV_REST_API_URL)')
    process.exit(1)
  }

  let redis = null
  let kv = null

  // 初始化 Redis
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 50, 2000)
      }
    })

    try {
      await redis.ping()
      console.log('✅ Redis 连接成功\n')
    } catch (error) {
      console.error('❌ Redis 连接失败:', error.message)
      process.exit(1)
    }
  }

  // 初始化 Vercel KV
  if (process.env.KV_REST_API_URL) {
    try {
      kv = require('@vercel/kv')
      console.log('✅ Vercel KV 可用\n')
    } catch (error) {
      console.warn('⚠️  Vercel KV 不可用，使用 Redis')
    }
  }

  try {
    // 获取当前用户
    let user = null
    const key = `user:${normalizedEmail}`

    if (kv && process.env.KV_REST_API_URL) {
      const data = await kv.hgetall(key)
      if (data && Object.keys(data).length > 0 && data.id) {
        user = data
      }
    } else if (redis) {
      const exists = await redis.exists(key)
      if (exists) {
        user = await redis.hgetall(key)
      }
    }

    if (!user) {
      console.error(`❌ 用户 ${email} 不存在`)
      process.exit(1)
    }

    console.log('📋 当前用户信息:')
    console.log('='.repeat(50))
    console.log('邮箱:', user.email)
    console.log('当前方案:', user.plan)
    console.log('当前积分:', user.credits || 0)
    console.log('='.repeat(50))
    console.log()

    // 计算订阅日期
    const now = new Date()
    const subscriptionStartDate = now.toISOString()
    
    // 月费会员：一个月后到期
    const subscriptionEndDate = new Date(now)
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)
    const subscriptionEndDateISO = subscriptionEndDate.toISOString()

    // 计算积分重置日期（下个月的第一天）
    const creditsResetDate = new Date(now)
    creditsResetDate.setMonth(creditsResetDate.getMonth() + 1)
    creditsResetDate.setDate(1)
    creditsResetDate.setHours(0, 0, 0, 0)
    const creditsResetDateISO = creditsResetDate.toISOString()

    // 更新用户信息
    const updates = {
      plan: 'monthly',
      credits: 150, // 月费会员初始积分
      creditsResetDate: creditsResetDateISO,
      subscriptionStartDate: subscriptionStartDate,
      subscriptionEndDate: subscriptionEndDateISO,
    }

    console.log('🔄 更新用户信息...')
    console.log('新方案: monthly (月费)')
    console.log('新积分: 150')
    console.log('订阅开始:', subscriptionStartDate)
    console.log('订阅结束:', subscriptionEndDateISO)
    console.log('积分重置日期:', creditsResetDateISO)
    console.log()

    // 保存更新
    if (kv && process.env.KV_REST_API_URL) {
      await kv.hset(key, {
        ...user,
        ...updates,
        credits: updates.credits.toString(),
      })
      console.log('✅ 已使用 Vercel KV 更新用户信息')
    } else if (redis) {
      await redis.hset(key, {
        ...user,
        plan: 'monthly',
        credits: '150',
        creditsResetDate: creditsResetDateISO,
        subscriptionStartDate: subscriptionStartDate,
        subscriptionEndDate: subscriptionEndDateISO,
      })
      console.log('✅ 已使用 Redis 更新用户信息')
    }

    // 验证更新
    let updatedUser = null
    if (kv && process.env.KV_REST_API_URL) {
      updatedUser = await kv.hgetall(key)
    } else if (redis) {
      updatedUser = await redis.hgetall(key)
    }

    console.log()
    console.log('✅ 更新完成！')
    console.log('='.repeat(50))
    console.log('邮箱:', updatedUser.email)
    console.log('方案:', updatedUser.plan)
    console.log('积分:', updatedUser.credits)
    console.log('订阅开始:', updatedUser.subscriptionStartDate)
    console.log('订阅结束:', updatedUser.subscriptionEndDate)
    console.log('积分重置日期:', updatedUser.creditsResetDate)
    console.log('='.repeat(50))

    if (redis) {
      await redis.quit()
    }
  } catch (error) {
    console.error('❌ 更新失败:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    if (redis) {
      await redis.quit()
    }
    process.exit(1)
  }
}

const email = process.argv[2] || 'lihongyangnju@gmail.com'
upgradeUserToMonthly(email).catch(error => {
  console.error('❌ 执行失败:', error.message)
  process.exit(1)
})

