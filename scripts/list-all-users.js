#!/usr/bin/env node

/**
 * 列出所有用户
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

async function listAllUsers() {
  const users = []
  const stats = {
    total: 0,
    byPlan: {
      free: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    },
    verified: 0,
    unverified: 0,
    withSubscription: 0,
    expired: 0
  }

  // 检查存储类型
  if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
    console.log('📦 使用 Redis 存储\n')
    
    const redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 50, 2000)
      }
    })
    
    try {
      await redis.ping()
      console.log('✅ Redis 连接成功\n')
      
      const keys = await redis.keys('user:*')
      console.log(`🔍 找到 ${keys.length} 个用户键\n`)
      
      for (const key of keys) {
        const email = key.replace('user:', '')
        const user = await redis.hgetall(key)
        
        if (user && user.id) {
          users.push({
            email: user.email,
            name: user.name,
            plan: user.plan || 'free',
            emailVerified: user.emailVerified === 'true',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            credits: user.credits || 0,
            subscriptionExpiresAt: user.subscriptionExpiresAt
          })
          
          // 统计
          stats.total++
          const plan = user.plan || 'free'
          if (plan === 'free' || plan === 'weekly' || plan === 'monthly' || plan === 'yearly') {
            stats.byPlan[plan] = (stats.byPlan[plan] || 0) + 1
          }
          if (user.emailVerified === 'true') stats.verified++
          else stats.unverified++
          if (user.subscriptionExpiresAt) {
            if (new Date(user.subscriptionExpiresAt) > new Date()) {
              stats.withSubscription++
            } else {
              stats.expired++
            }
          }
        }
      }
      
      await redis.quit()
    } catch (error) {
      console.error('❌ Redis 错误:', error.message)
      process.exit(1)
    }
  } else if (process.env.KV_REST_API_URL) {
    console.log('📦 使用 Vercel KV 存储\n')
    console.log('⚠️  KV 存储不支持直接列出所有用户')
    console.log('   需要使用其他方式获取用户列表\n')
    return
  } else {
    console.log('📦 使用文件存储\n')
    
    try {
      const DATA_DIR = path.join(process.cwd(), 'data')
      const USERS_FILE = path.join(DATA_DIR, 'users.json')
      
      if (!fs.existsSync(USERS_FILE)) {
        console.log('❌ 用户文件不存在')
        return
      }
      
      const raw = fs.readFileSync(USERS_FILE, 'utf8')
      const json = JSON.parse(raw || '{"users":[]}')
      
      for (const user of json.users || []) {
        users.push({
          email: user.email,
          name: user.name,
          plan: user.plan || 'free',
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          credits: user.credits || 0,
          subscriptionExpiresAt: user.subscriptionExpiresAt
        })
        
        // 统计
        stats.total++
        const plan = user.plan || 'free'
        if (plan === 'free' || plan === 'weekly' || plan === 'monthly' || plan === 'yearly') {
          stats.byPlan[plan] = (stats.byPlan[plan] || 0) + 1
        }
        if (user.emailVerified) stats.verified++
        else stats.unverified++
        if (user.subscriptionExpiresAt) {
          if (new Date(user.subscriptionExpiresAt) > new Date()) {
            stats.withSubscription++
          } else {
            stats.expired++
          }
        }
      }
    } catch (error) {
      console.error('❌ 文件读取错误:', error.message)
      process.exit(1)
    }
  }

  // 按注册时间排序（最新的在前）
  users.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })

  // 显示统计信息
  console.log('='.repeat(60))
  console.log('📊 用户统计')
  console.log('='.repeat(60))
  console.log(`总用户数: ${stats.total}`)
  console.log(`已验证: ${stats.verified}`)
  console.log(`未验证: ${stats.unverified}`)
  console.log(`活跃订阅: ${stats.withSubscription}`)
  console.log(`过期订阅: ${stats.expired}`)
  console.log()
  console.log('按计划统计:')
  console.log(`  免费用户: ${stats.byPlan.free}`)
  console.log(`  周付用户: ${stats.byPlan.weekly}`)
  console.log(`  月付用户: ${stats.byPlan.monthly}`)
  console.log(`  年付用户: ${stats.byPlan.yearly}`)
  console.log('='.repeat(60))
  console.log()

  // 显示用户列表
  if (users.length === 0) {
    console.log('❌ 没有找到用户')
    return
  }

  console.log('📋 用户列表:')
  console.log('='.repeat(60))
  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.name || '未设置'} (${user.email})`)
    console.log(`   计划: ${user.plan}`)
    console.log(`   已验证: ${user.emailVerified ? '✅' : '❌'}`)
    console.log(`   积分: ${user.credits}`)
    if (user.subscriptionExpiresAt) {
      const expiresAt = new Date(user.subscriptionExpiresAt)
      const isActive = expiresAt > new Date()
      console.log(`   订阅: ${isActive ? '✅ 活跃' : '❌ 已过期'} (${expiresAt.toLocaleDateString('zh-CN')})`)
    }
    console.log(`   注册时间: ${user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '未知'}`)
    if (user.lastLoginAt) {
      console.log(`   最后登录: ${new Date(user.lastLoginAt).toLocaleString('zh-CN')}`)
    }
  })
  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ 共找到 ${users.length} 个用户`)
}

listAllUsers().catch(error => {
  console.error('❌ 列出用户失败:', error.message)
  process.exit(1)
})

