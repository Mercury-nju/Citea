// 直接测试密钥
const fs = require('fs')
const path = require('path')

// 加载环境变量
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (value && !value.startsWith('#')) {
        process.env[key.trim()] = value
      }
    }
  })
}

console.log('=== 密钥检查 ===')
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('ANON_KEY长度:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)
console.log('SERVICE_KEY长度:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)

// 检查密钥格式
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (anonKey) {
  const parts = anonKey.split('.')
  console.log('ANON_KEY JWT部分数量:', parts.length)
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      console.log('ANON_KEY角色:', payload.role)
      console.log('ANON_KEY过期时间:', new Date(payload.exp * 1000))
    } catch (e) {
      console.log('ANON_KEY解析失败:', e.message)
    }
  }
}

if (serviceKey) {
  const parts = serviceKey.split('.')
  console.log('SERVICE_KEY JWT部分数量:', parts.length)
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      console.log('SERVICE_KEY角色:', payload.role)
      console.log('SERVICE_KEY过期时间:', new Date(payload.exp * 1000))
    } catch (e) {
      console.log('SERVICE_KEY解析失败:', e.message)
    }
  }
}