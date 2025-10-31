#!/usr/bin/env node

/**
 * 数据迁移脚本：从文件存储迁移到 Redis
 * 
 * 使用方法:
 *   node scripts/migrate-to-redis.js
 * 
 * 环境变量:
 *   REDIS_URL - Redis 连接 URL (必需)
 */

const fs = require('fs').promises
const path = require('path')
const Redis = require('ioredis')

// 配置
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')
const REDIS_URL = process.env.REDIS_URL

async function main() {
  console.log('🚀 Citea 数据迁移工具\n')

  // 检查 Redis URL
  if (!REDIS_URL) {
    console.error('❌ 错误: 未设置 REDIS_URL 环境变量')
    console.log('\n使用方法:')
    console.log('  REDIS_URL=redis://localhost:6379 node scripts/migrate-to-redis.js\n')
    process.exit(1)
  }

  // 连接 Redis
  console.log('📡 连接到 Redis...')
  const redis = new Redis(REDIS_URL)
  
  try {
    await redis.ping()
    console.log('✅ Redis 连接成功\n')
  } catch (error) {
    console.error('❌ Redis 连接失败:', error.message)
    process.exit(1)
  }

  // 读取文件数据
  console.log('📂 读取本地数据文件...')
  let usersData
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf8')
    usersData = JSON.parse(fileContent)
    console.log(`✅ 找到 ${usersData.users?.length || 0} 个用户\n`)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ 错误: 未找到数据文件', DATA_FILE)
      console.log('提示: 确保在本地环境已经创建了用户数据\n')
    } else {
      console.error('❌ 读取文件失败:', error.message)
    }
    await redis.quit()
    process.exit(1)
  }

  const users = usersData.users || []
  if (users.length === 0) {
    console.log('⚠️  没有用户数据需要迁移')
    await redis.quit()
    return
  }

  // 迁移数据
  console.log('🔄 开始迁移...\n')
  let successCount = 0
  let errorCount = 0

  for (const user of users) {
    try {
      const key = `user:${user.email.toLowerCase()}`
      
      // 检查是否已存在
      const exists = await redis.exists(key)
      if (exists) {
        console.log(`⏭️  跳过 ${user.email} (已存在)`)
        continue
      }

      // 写入 Redis
      await redis.hset(key, {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        plan: user.plan || 'free',
        createdAt: user.createdAt || new Date().toISOString(),
        lastLoginAt: user.lastLoginAt || new Date().toISOString()
      })

      console.log(`✅ 迁移成功: ${user.email}`)
      successCount++
    } catch (error) {
      console.error(`❌ 迁移失败: ${user.email} - ${error.message}`)
      errorCount++
    }
  }

  // 统计结果
  console.log('\n' + '='.repeat(50))
  console.log('📊 迁移完成!')
  console.log(`✅ 成功: ${successCount}`)
  console.log(`❌ 失败: ${errorCount}`)
  console.log(`⏭️  跳过: ${users.length - successCount - errorCount}`)
  console.log('='.repeat(50) + '\n')

  // 验证迁移
  console.log('🔍 验证迁移结果...')
  const keys = await redis.keys('user:*')
  console.log(`✅ Redis 中共有 ${keys.length} 个用户\n`)

  // 显示示例用户
  if (keys.length > 0) {
    console.log('示例用户数据:')
    const sampleKey = keys[0]
    const sampleUser = await redis.hgetall(sampleKey)
    console.log(JSON.stringify(sampleUser, null, 2))
    console.log()
  }

  // 关闭连接
  await redis.quit()
  console.log('✅ 完成!\n')
}

main().catch(error => {
  console.error('❌ 发生错误:', error)
  process.exit(1)
})

