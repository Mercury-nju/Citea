// 直接检查进程环境变量
console.log('=== 进程环境变量 ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50) + '...')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 50) + '...')

// 检查文件系统
const fs = require('fs')
const path = require('path')

console.log('\n=== 文件检查 ===')
const envPath = path.join(process.cwd(), '.env.local')
console.log('.env.local exists:', fs.existsSync(envPath))

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  console.log('文件内容长度:', content.length)
  
  // 解析文件内容
  const lines = content.split('\n')
  lines.forEach((line, index) => {
    if (line.includes('SUPABASE')) {
      console.log(`行 ${index + 1}:`, line)
    }
  })
}

// 检查是否有其他环境变量源
console.log('\n=== 其他环境变量源 ===')
console.log('process.env.SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('process.env.SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY)
console.log('process.env.SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY)