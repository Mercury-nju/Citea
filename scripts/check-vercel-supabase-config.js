const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function checkVercelSupabaseConfig() {
  console.log('=== 检查Vercel Supabase配置 ===\n');
  
  // 1. 检查本地环境变量
  console.log('1. 本地环境变量检查:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未配置');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已配置' : '❌ 未配置');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已配置' : '❌ 未配置');
  
  // 2. 测试Supabase连接
  console.log('\n2. Supabase连接测试:');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('   ❌ Supabase连接失败:', error.message);
    } else {
      console.log('   ✅ Supabase连接成功');
    }
  } catch (err) {
    console.log('   ❌ Supabase连接错误:', err.message);
  }
  
  // 3. 检查Vercel环境变量需求
  console.log('\n3. Vercel部署所需环境变量:');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'REDIS_URL',
    'JWT_SECRET'
  ];
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: 已配置`);
    } else {
      console.log(`   ❌ ${varName}: 未配置`);
    }
  });
  
  // 4. 提供Vercel配置指导
  console.log('\n4. Vercel配置指导:');
  console.log('   📋 你需要在Vercel项目设置中配置以下环境变量:');
  console.log('   🔗 访问: https://vercel.com/dashboard');
  console.log('   📍 找到你的项目 → Settings → Environment Variables');
  console.log('');
  console.log('   需要添加的环境变量:');
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ${varName}=${value.substring(0, 20)}...`);
    }
  });
  
  console.log('\n5. 部署建议:');
  console.log('   ✅ 确保所有环境变量都在Vercel中配置');
  console.log('   ✅ 重新部署项目以应用新配置');
  console.log('   ✅ 检查部署日志中的错误信息');
  
  console.log('\n=== 检查完成 ===');
}

checkVercelSupabaseConfig().catch(console.error);