#!/usr/bin/env node

/**
 * 重置用户密码
 * 
 * 使用方法:
 *   node scripts/reset-password.js <email> <new-password>
 * 
 * 示例:
 *   node scripts/reset-password.js lihongyangnju@gmail.com TestPassword123!
 */

const Redis = require('ioredis')
const bcrypt = require('bcryptjs')
const fs = require('fs').promises
const path = require('path')

// 从命令行参数获取邮箱和新密码
const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.error('❌ 用法: node scripts/reset-password.js <email> <new-password>')
  console.error('示例: node scripts/reset-password.js lihongyangnju@gmail.com TestPassword123!')
  process.exit(1)
}

// 加载环境变量
async function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  try {
    const envContent = await fs.readFile(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
      }
    })
  } catch {
    // 文件不存在，继续
  }
}

async function resetPassword() {
  await loadEnv()
  console.log('🔐 重置用户密码\n')
  console.log(`📧 邮箱: ${email}`)
  console.log(`🔑 新密码: ${newPassword}\n`)

  const passwordHash = await bcrypt.hash(newPassword, 10)

  // 尝试 Redis
  if (process.env.REDIS_URL) {
    try {
      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null
          return Math.min(times * 50, 2000)
        }
      })

      const key = `user:${email.toLowerCase()}`
      const exists = await redis.exists(key)

      if (!exists) {
        console.error('❌ 用户不存在')
        await redis.quit()
        process.exit(1)
      }

      // 获取用户信息
      const user = await redis.hgetall(key)
      console.log('✅ 找到用户:', user.name || email)

      // 更新密码
      await redis.hset(key, {
        passwordHash: passwordHash,
        // 同时设置邮箱为已验证，方便登录
        emailVerified: 'true'
      })

      console.log('✅ 密码已重置')
      console.log('✅ 邮箱验证状态已设置为已验证')
      await redis.quit()
      return
    } catch (error) {
      console.error('❌ Redis 操作失败:', error.message)
      console.log('⚠️  尝试使用文件存储...')
    }
  }

  // 尝试文件存储
  const dataDir = path.join(process.cwd(), 'data')
  const usersFile = path.join(dataDir, 'users.json')

  try {
    await fs.mkdir(dataDir, { recursive: true })
    
    let usersData = { users: [] }
    try {
      const content = await fs.readFile(usersFile, 'utf8')
      usersData = JSON.parse(content)
    } catch {
      // 文件不存在
    }

    const userIndex = usersData.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (userIndex === -1) {
      console.error('❌ 用户不存在')
      process.exit(1)
    }

    // 更新密码
    usersData.users[userIndex].passwordHash = passwordHash
    usersData.users[userIndex].emailVerified = true

    await fs.writeFile(usersFile, JSON.stringify(usersData, null, 2))
    console.log('✅ 密码已重置')
    console.log('✅ 邮箱验证状态已设置为已验证')
  } catch (error) {
    console.error('❌ 文件操作失败:', error.message)
    process.exit(1)
  }
}

resetPassword().catch(error => {
  console.error('❌ 发生错误:', error)
  process.exit(1)
})

