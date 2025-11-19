/**
 * 重建 Vercel KV 用户索引
 * 此脚本用于为现有的 KV 存储用户创建索引
 * 
 * 使用方法:
 * node scripts/rebuild-kv-user-index.js
 */

require('dotenv').config({ path: '.env.local' })

async function rebuildKVUserIndex() {
  try {
    // 检查是否配置了 KV
    if (!process.env.KV_REST_API_URL) {
      console.log('❌ KV_REST_API_URL 未配置')
      console.log('此脚本仅适用于 Vercel KV 存储')
      return
    }

    const kv = require('@vercel/kv')
    console.log('✅ 连接到 Vercel KV...')

    // 注意：Vercel KV 不支持直接列出所有 key
    // 我们需要手动维护用户索引
    // 这个脚本主要用于重建索引，如果你知道一些用户邮箱，可以手动添加

    console.log('\n📝 重建用户索引')
    console.log('注意：Vercel KV 不支持列出所有 key')
    console.log('如果你知道用户邮箱，可以手动添加到索引中')
    console.log('\n如果你想重建索引，请：')
    console.log('1. 从其他来源获取用户邮箱列表')
    console.log('2. 运行此脚本并传入邮箱列表')
    console.log('3. 或者等待新用户注册，索引会自动更新\n')

    // 检查现有索引
    const existingIndex = await kv.get('users:index')
    if (existingIndex && Array.isArray(existingIndex)) {
      console.log(`✅ 找到现有索引，包含 ${existingIndex.length} 个用户`)
      console.log('用户列表:', existingIndex)
    } else {
      console.log('ℹ️  未找到现有索引')
      console.log('新用户注册时会自动创建索引')
    }

    // 如果有命令行参数，将其作为用户邮箱添加到索引
    const args = process.argv.slice(2)
    if (args.length > 0) {
      console.log('\n📝 添加用户到索引...')
      const emails = args.map(email => email.toLowerCase())
      const currentIndex = (await kv.get('users:index')) || []
      const updatedIndex = [...new Set([...currentIndex, ...emails])]
      await kv.set('users:index', updatedIndex)
      console.log(`✅ 已添加 ${emails.length} 个用户到索引`)
      console.log('当前索引:', updatedIndex)
    }

    console.log('\n✅ 完成')
  } catch (error) {
    console.error('❌ 错误:', error.message)
    console.error(error)
    process.exit(1)
  }
}

rebuildKVUserIndex()






