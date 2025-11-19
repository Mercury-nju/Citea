require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseLive() {
  console.log('=== 实时测试新的Supabase项目 ===');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    // 生成唯一邮箱
    const timestamp = Date.now();
    const testEmail = `live-test-${timestamp}@gmail.com`;
    
    console.log('📧 测试邮箱:', testEmail);
    console.log('🔗 项目URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // 测试注册
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test123456'
    });
    
    if (error) {
      console.log('❌ 注册失败');
      console.log('错误码:', error.status);
      console.log('错误信息:', error.message);
      
      // 检查具体错误类型
      if (error.message.includes('invalid')) {
        console.log('💡 提示: 邮箱格式问题或邮件服务未配置');
      } else if (error.message.includes('already exists')) {
        console.log('💡 提示: 用户已存在');
      } else {
        console.log('💡 提示: 检查Supabase邮件配置');
      }
    } else {
      console.log('✅ 注册请求成功！');
      console.log('用户ID:', data.user?.id);
      console.log('用户邮箱:', data.user?.email);
      
      // 检查邮件验证状态
      if (data.user?.email_confirmed_at === null) {
        console.log('📋 用户未验证，验证邮件应该已发送');
        console.log('📧 请检查邮箱是否收到验证邮件');
      } else {
        console.log('✅ 用户已验证');
      }
      
      // 测试登录
      console.log('\n=== 测试登录功能 ===');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'Test123456'
      });
      
      if (loginError) {
        console.log('❌ 登录失败:', loginError.message);
      } else {
        console.log('✅ 登录成功');
        console.log('会话状态:', loginData.session ? '活跃' : '无会话');
      }
    }
    
  } catch (err) {
    console.error('🚨 严重错误:', err.message);
  }
}

testSupabaseLive();