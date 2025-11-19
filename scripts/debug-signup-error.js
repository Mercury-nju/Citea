// Debug signup error
async function debugSignupError() {
  console.log('🔍 调试注册错误...')
  
  const testUser = {
    name: '调试用户',
    email: 'debug@example.com',
    password: 'Debug123456'
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
    
    if (!response.ok) {
      console.log('❌ 注册失败')
      console.log('错误详情:', data.message || data.error)
      if (data.details) {
        console.log('详细错误:', data.details)
      }
    }
    
  } catch (error) {
    console.error('❌ 网络错误:', error.message)
  }
}

debugSignupError()