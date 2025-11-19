require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testNewSupabase() {
  console.log('=== 测试新的Supabase项目 ===');
  
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('项目URL:', projectUrl);
  console.log('API密钥长度:', anonKey?.length);
  
  try {
    // 测试1: 验证API密钥
    console.log('\n1. 测试API连接...');
    const authResponse = await axios.get(`${projectUrl}/auth/v1/settings`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    console.log('✅ API连接成功');
    console.log('邮件配置:', authResponse.data?.external_email_enabled);
    
    // 测试2: 尝试发送测试邮件
    console.log('\n2. 测试邮件发送功能...');
    
    const testEmail = 'test-new-supabase@example.com';
    const testResponse = await axios.post(
      `${projectUrl}/auth/v1/signup`,
      {
        email: testEmail,
        password: 'TestPassword123!'
      },
      {
        headers: {
          'apikey': anonKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ 注册请求发送成功');
    console.log('状态码:', testResponse.status);
    console.log('邮件发送:', testResponse.data?.emailSent);
    
    if (testResponse.data?.emailSent) {
      console.log('🎉 邮件发送成功！');
    } else {
      console.log('⚠️  邮件未发送，可能需要在Supabase控制台配置');
    }
    
  } catch (error) {
    console.log('❌ 测试失败');
    console.log('错误码:', error.response?.status);
    console.log('错误信息:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 400) {
      console.log('💡 提示: 检查邮件配置或用户已存在');
    }
  }
}

testNewSupabase();