const { createClient } = require('@supabase/supabase-js')
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
  console.log('✅ 已加载 .env.local 文件')
} else {
  console.log('❌ 未找到 .env.local 文件')
}

// 检查环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n=== 环境变量检查 ===')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '已设置' : '未设置')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '已设置' : '未设置')

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('❌ Supabase 环境变量不完整')
  process.exit(1)
}

async function testSupabaseConnection() {
  console.log('\n=== 测试 Supabase 连接 ===')
  
  try {
    // 测试匿名客户端
    console.log('测试匿名客户端...')
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data, error } = await anonClient
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('匿名客户端错误:', error.message)
    } else {
      console.log('✅ 匿名客户端连接成功')
    }
    
    // 测试服务角色客户端
    console.log('\n测试服务角色客户端...')
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (serviceError) {
      console.log('服务角色客户端错误:', serviceError.message)
      console.log('错误详情:', serviceError)
    } else {
      console.log('✅ 服务角色客户端连接成功')
    }
    
    // 测试用户管理功能
    console.log('\n测试用户管理功能...')
    const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers()
    
    if (usersError) {
      console.log('用户管理错误:', usersError.message)
      console.log('用户管理错误详情:', usersError)
    } else {
      console.log('✅ 用户管理功能正常')
      console.log('用户数量:', usersData.users.length)
    }
    
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message)
    console.log('错误堆栈:', error.stack)
  }
}

testSupabaseConnection()