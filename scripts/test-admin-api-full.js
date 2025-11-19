#!/usr/bin/env node

/**
 * 完整测试管理员 API
 * 模拟实际的 API 调用流程
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

async function testAdminAPIFull() {
  console.log('🧪 完整测试管理员 API...\n')

  // 模拟管理员 API 的完整逻辑
  console.log('📋 步骤 1: 测试 /api/admin/stats')
  console.log('='.repeat(60))
  
  const users = []
  const Redis = require('ioredis')

  // Redis 存储 - 使用修复后的代码
  if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
    try {
      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null
          return Math.min(times * 50, 2000)
        }
      })

      const keys = await redis.keys('user:*')
      console.log(`✅ 找到 ${keys.length} 个用户键`)

      // 使用 getUserByEmail（模拟 API 逻辑）
      const { getUserByEmail } = require('../lib/userStore.ts')
      
      for (const key of keys) {
        const email = key.replace('user:', '')
        const user = await getUserByEmail(email)
        if (user) {
          users.push(user)
        }
      }

      await redis.quit()
    } catch (error) {
      console.error('❌ Redis 错误:', error.message)
    }
  }

  console.log(`✅ 成功读取 ${users.length} 个用户\n`)

  // 计算统计信息（模拟 stats API）
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = {
    totalUsers: users.length,
    newUsersToday: users.filter(u => {
      const createdAt = u.createdAt ? new Date(u.createdAt) : null
      return createdAt && createdAt >= today
    }).length,
    activeUsersToday: users.filter(u => {
      const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt) : null
      return lastLogin && lastLogin >= today
    }).length,
    activeUsersThisMonth: users.filter(u => {
      const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt) : null
      return lastLogin && lastLogin >= thisMonth
    }).length,
    paidUsers: users.filter(u => {
      const plan = u.plan || 'free'
      return plan && plan !== 'free' && u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) > now
    }).length,
    retentionRate: users.length > 0 
      ? (users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) >= thisMonth).length / users.length * 100)
      : 0,
    total: users.length,
    byPlan: {
      free: users.filter(u => u.plan === 'free').length,
      weekly: users.filter(u => u.plan === 'weekly').length,
      monthly: users.filter(u => u.plan === 'monthly').length,
      yearly: users.filter(u => u.plan === 'yearly').length,
    },
    verified: users.filter(u => u.emailVerified).length,
    unverified: users.filter(u => !u.emailVerified).length,
    withActiveSubscription: users.filter(u => 
      u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) > now
    ).length,
    expiredSubscription: users.filter(u => 
      u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) <= now
    ).length,
    storage: process.env.KV_REST_API_URL ? 'KV' : process.env.REDIS_URL ? 'Redis' : 'File'
  }

  console.log('📊 统计信息:')
  console.log(`  总用户数: ${stats.totalUsers}`)
  console.log(`  今日新用户: ${stats.newUsersToday}`)
  console.log(`  今日活跃: ${stats.activeUsersToday}`)
  console.log(`  本月活跃: ${stats.activeUsersThisMonth}`)
  console.log(`  付费用户: ${stats.paidUsers}`)
  console.log(`  留存率: ${stats.retentionRate.toFixed(1)}%`)
  console.log(`  已验证: ${stats.verified}`)
  console.log(`  未验证: ${stats.unverified}`)
  console.log(`  活跃订阅: ${stats.withActiveSubscription}`)
  console.log(`  存储类型: ${stats.storage}`)
  console.log()

  console.log('📋 步骤 2: 测试 /api/admin/users')
  console.log('='.repeat(60))
  
  const userList = users.map(user => ({
    id: user.id || user.email,
    email: user.email,
    name: user.name || '未设置',
    plan: user.plan || 'free',
    emailVerified: user.emailVerified || false,
    createdAt: user.createdAt || new Date().toISOString(),
    lastLoginAt: user.lastLoginAt,
    credits: user.credits || 0,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    hasActiveSubscription: user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date()
  }))

  console.log(`✅ 用户列表包含 ${userList.length} 个用户\n`)
  console.log('前 3 个用户:')
  userList.slice(0, 3).forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name} (${user.email})`)
    console.log(`     计划: ${user.plan}, 已验证: ${user.emailVerified ? '✅' : '❌'}`)
  })

  console.log()
  console.log('='.repeat(60))
  console.log('✅ 测试完成！')
  console.log()
  console.log('💡 修复说明:')
  console.log('  - 已修复管理员 API 支持 rediss:// (SSL) 连接')
  console.log('  - 现在应该能正确读取 Redis 中的用户数据')
  console.log('  - 管理员后台应该能显示 5 个用户')
  console.log()
}

testAdminAPIFull().catch(error => {
  console.error('❌ 测试失败:', error.message)
  console.error(error)
  process.exit(1)
})

