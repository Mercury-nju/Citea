// Test web signup functionality
async function testWebSignup() {
  console.log('🌐 测试网页注册功能...')
  
  const testUser = {
    name: '网页用户',
    email: 'webuser@example.com',
    password: 'Web123456'
  }
  
  try {
    console.log('📤 发送注册请求...')
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    })
    
    const data = await response.json()
    console.log('📥 响应状态:', response.status)
    console.log('📥 响应数据:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ 网页注册成功!')
      
      // Test login with the new user
      console.log('🔐 测试登录...')
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
      console.log('📥 登录响应:', loginResponse.status)
      
      if (loginResponse.ok) {
        console.log('✅ 登录成功!')
      } else {
        console.log('❌ 登录失败:', loginData.message || loginData.error)
      }
      
    } else {
      console.log('❌ 注册失败:', data.message || data.error)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

testWebSignup()