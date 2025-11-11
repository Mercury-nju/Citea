const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnoseSupabaseKeys() {
  console.log('=== Supabase 密钥诊断 ===\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('1. 环境变量检查:');
  console.log('   URL:', supabaseUrl ? '✅ 已配置' : '❌ 缺失');
  console.log('   Anon Key:', anonKey ? `✅ 已配置 (${anonKey.length} 字符)` : '❌ 缺失');
  console.log('   Service Key:', serviceKey ? `✅ 已配置 (${serviceKey.length} 字符)` : '❌ 缺失');
  
  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.log('\n❌ 环境变量配置不完整');
    return;
  }
  
  console.log('\n2. 密钥格式检查:');
  console.log('   Anon Key 前缀:', anonKey.substring(0, 20) + '...');
  console.log('   Service Key 前缀:', serviceKey.substring(0, 20) + '...');
  
  // 检查是否为JWT格式
  const isAnonJWT = anonKey.split('.').length === 3;
  const isServiceJWT = serviceKey.split('.').length === 3;
  
  console.log('\n3. JWT格式检查:');
  console.log('   Anon Key JWT格式:', isAnonJWT ? '✅ 正确' : '❌ 错误');
  console.log('   Service Key JWT格式:', isServiceJWT ? '✅ 正确' : '❌ 错误');
  
  // 尝试解码JWT
  if (isAnonJWT) {
    try {
      const payload = JSON.parse(Buffer.from(anonKey.split('.')[1], 'base64').toString());
      console.log('\n4. Anon Key 载荷信息:');
      console.log('   角色:', payload.role);
      console.log('   项目ID:', payload.sub || '无');
      console.log('   过期时间:', new Date(payload.exp * 1000).toLocaleString());
    } catch (e) {
      console.log('\n❌ Anon Key 解码失败:', e.message);
    }
  }
  
  if (isServiceJWT) {
    try {
      const payload = JSON.parse(Buffer.from(serviceKey.split('.')[1], 'base64').toString());
      console.log('\n5. Service Key 载荷信息:');
      console.log('   角色:', payload.role);
      console.log('   项目ID:', payload.sub || '无');
      console.log('   过期时间:', new Date(payload.exp * 1000).toLocaleString());
    } catch (e) {
      console.log('\n❌ Service Key 解码失败:', e.message);
    }
  }
  
  // 测试基本连接
  console.log('\n6. 连接测试:');
  
  // 测试Anon Key
  try {
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data, error } = await anonClient.from('profiles').select('id').limit(1);
    
    if (error) {
      console.log('   Anon Key 连接: ❌ 失败 -', error.message);
    } else {
      console.log('   Anon Key 连接: ✅ 成功');
    }
  } catch (e) {
    console.log('   Anon Key 连接: ❌ 错误 -', e.message);
  }
  
  // 测试Service Key
  try {
    const serviceClient = createClient(supabaseUrl, serviceKey);
    const { data, error } = await serviceClient.from('profiles').select('id').limit(1);
    
    if (error) {
      console.log('   Service Key 连接: ❌ 失败 -', error.message);
    } else {
      console.log('   Service Key 连接: ✅ 成功');
    }
  } catch (e) {
    console.log('   Service Key 连接: ❌ 错误 -', e.message);
  }
  
  console.log('\n=== 诊断完成 ===');
  console.log('\n建议:');
  console.log('1. 如果Anon Key失败，检查项目URL是否正确');
  console.log('2. 如果Service Key失败，可能需要重新生成');
  console.log('3. 检查Supabase项目是否被暂停或删除');
  console.log('4. 访问 Supabase Dashboard 确认项目状态');
}

diagnoseSupabaseKeys().catch(console.error);