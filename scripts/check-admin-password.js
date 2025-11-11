#!/usr/bin/env node

/**
 * 检查管理员密码配置
 */

console.log('🔐 管理员密码配置检查\n')
console.log('='.repeat(60))
console.log()

// 检查本地环境变量
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  let hasAdminPassword = false
  let adminPasswordValue = ''
  
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return
    const match = line.match(/^ADMIN_PASSWORD=(.*)$/)
    if (match) {
      hasAdminPassword = true
      adminPasswordValue = match[1].trim().replace(/^["']|["']$/g, '')
    }
  })
  
  if (hasAdminPassword) {
    console.log('✅ 本地环境变量 ADMIN_PASSWORD 已配置')
    console.log(`   密码: ${adminPasswordValue.substring(0, 3)}${'*'.repeat(Math.max(0, adminPasswordValue.length - 3))}`)
  } else {
    console.log('⚠️  本地环境变量 ADMIN_PASSWORD 未配置')
    console.log('   将使用默认密码: admin123')
  }
} else {
  console.log('⚠️  .env.local 文件不存在')
  console.log('   将使用默认密码: admin123')
}

console.log()
console.log('='.repeat(60))
console.log()
console.log('📋 密码使用说明:')
console.log()
console.log('1. 本地开发:')
console.log('   - 如果设置了 ADMIN_PASSWORD 环境变量，使用该值')
console.log('   - 否则使用默认密码: admin123')
console.log()
console.log('2. 生产环境 (Vercel):')
console.log('   - 检查 Vercel Dashboard > Settings > Environment Variables')
console.log('   - 查找 ADMIN_PASSWORD 变量')
console.log('   - 如果设置了，使用该值')
console.log('   - 否则使用默认密码: admin123')
console.log()
console.log('3. 修改生产环境密码:')
console.log('   - 在 Vercel Dashboard 添加/修改 ADMIN_PASSWORD 环境变量')
console.log('   - 重新部署项目（或等待自动部署）')
console.log()
console.log('⚠️  安全提示:')
console.log('   - 生产环境强烈建议修改默认密码！')
console.log('   - 使用强密码（至少12个字符，包含大小写字母、数字和特殊字符）')
console.log()






