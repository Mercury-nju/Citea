const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_BASE = 'http://localhost:3000/api';

async function testSignupFlow() {
  const testEmail = 'test-supabase-migration@example.com';
  const testPassword = 'Test123456';
  
  console.log('=== 测试注册流程 ===');
  console.log('测试邮箱:', testEmail);
  
  try {
    // 步骤1: 注册用户
    console.log('\n1. 发送注册请求...');
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
      email: testEmail,
      password: testPassword,
      name: '测试用户'
    });
    
    console.log('注册响应状态:', signupResponse.status);
    console.log('注册响应数据:', JSON.stringify(signupResponse.data, null, 2));
    
    if (signupResponse.data.success) {
      console.log('✅ 注册请求发送成功');
      console.log('用户ID:', signupResponse.data.userId);
      
      // 步骤2: 检查Redis中的验证码
      console.log('\n2. 检查Redis中的验证码...');
      await checkVerificationCode(testEmail);
      
    } else {
      console.log('❌ 注册失败:', signupResponse.data.message);
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

async function checkVerificationCode(email) {
  const Redis = require('ioredis');
  const redisClient = new Redis('redis://localhost:6379');
  
  try {
    // 等待2秒让验证码存储
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const key = `user:${email}`;
    const code = await redisClient.hget(key, 'verificationCode');
    
    console.log('Redis中的验证码:', code);
    console.log('验证码类型:', typeof code);
    
    if (code && code !== '[object Object]') {
      console.log('✅ 验证码正确存储为字符串');
      
      // 步骤3: 尝试验证邮箱
      console.log('\n3. 验证邮箱...');
      await verifyEmail(email, code);
    } else {
      console.log('❌ 验证码存储有问题');
    }
    
    await redisClient.quit();
  } catch (error) {
    console.error('Redis检查失败:', error);
    await redisClient.quit();
  }
}

async function verifyEmail(email, code) {
  try {
    const verifyResponse = await axios.post(`${API_BASE}/auth/verify-email`, {
      email: email,
      code: code
    });
    
    console.log('验证响应状态:', verifyResponse.status);
    console.log('验证响应数据:', JSON.stringify(verifyResponse.data, null, 2));
    
    if (verifyResponse.data.success) {
      console.log('✅ 邮箱验证成功');
    } else {
      console.log('❌ 邮箱验证失败:', verifyResponse.data.message);
    }
  } catch (error) {
    console.error('验证请求失败:', error.response?.data || error.message);
  }
}

// 运行测试
testSignupFlow().catch(console.error);