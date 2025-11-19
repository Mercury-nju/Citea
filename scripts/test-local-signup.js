// 测试本地注册功能（绕过Supabase）
import fs from 'fs'
import path from 'path'

async function testLocalSignup() {
  console.log('🧪 测试本地注册功能...')
  
  const testUser = {
    name: '测试用户',
    email: 'test@example.com',
    password: 'Test123456'
  }
  
  try {
    console.log('📤 发送注册请求到 /api/auth/signup-local...')
    
    const response = await fetch('http://localhost:3000/api/auth/signup-local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    })
    
    const data = await response.json()
    
    console.log('📥 响应状态:', response.status)
    console.log('📄 响应数据:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ 本地注册成功!')
      
      // 检查用户文件是否创建
      const usersFile = path.join(process.cwd(), 'data', 'users.json')
      if (fs.existsSync(usersFile)) {
        const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
        console.log('📊 用户数据:', usersData)
      }
      
      // 测试登录
      console.log('\n🔐 测试登录...')
      const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      })
      
      const loginData = await loginResponse.json()
      console.log('📥 登录响应:', loginData)
      
      if (loginResponse.ok) {
        console.log('✅ 登录成功!')
      } else {
        console.log('❌ 登录失败:', loginData.message)
      }
      
    } else {
      console.log('❌ 注册失败:', data.message || data.error)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testLocalSignup()