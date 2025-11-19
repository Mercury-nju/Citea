// 直接测试Supabase连接，不使用环境变量
const { createClient } = require('@supabase/supabase-js')

// 直接使用硬编码的值进行测试
const TEST_URL = 'https://cgbjrnowqkdqhsbbbpoz.supabase.co'
const TEST_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWRxZHNiYmJwb3oiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc2Mjc4MjU2NywiZXhwIjoyMDc4MzU4NTY3fQ.U4oCBMbi6_9MKDuXWboRHlALy8PwAPOS83kJTirbspM'
const TEST_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWRxZHNiYmJwb3oiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzYyNzgyNTY3LCJleHAiOjIwNzgzNTg1NjN9.6ek3D_T4NzuCSv5SxHGjfKj-sHSj3Mgxaw_o_uOVFqE'

async function testDirectConnection() {
  console.log('=== 直接连接测试 ===')
  console.log('URL:', TEST_URL)
  console.log('ANON_KEY长度:', TEST_ANON_KEY.length)
  console.log('SERVICE_KEY长度:', TEST_SERVICE_KEY.length)
  
  try {
    // 测试匿名客户端
    console.log('\n测试匿名客户端...')
    const anonClient = createClient(TEST_URL, TEST_ANON_KEY)
    
    const { data, error } = await anonClient
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('❌ 匿名客户端错误:', error.message)
      console.log('错误详情:', error)
    } else {
      console.log('✅ 匿名客户端连接成功')
      console.log('数据:', data)
    }
    
    // 测试服务角色客户端
    console.log('\n测试服务角色客户端...')
    const serviceClient = createClient(TEST_URL, TEST_SERVICE_KEY, {
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
      console.log('❌ 服务角色客户端错误:', serviceError.message)
      console.log('错误详情:', serviceError)
    } else {
      console.log('✅ 服务角色客户端连接成功')
      console.log('数据:', serviceData)
    }
    
    // 测试用户管理功能
    console.log('\n测试用户管理功能...')
    const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers()
    
    if (usersError) {
      console.log('❌ 用户管理错误:', usersError.message)
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

testDirectConnection()