// 加载环境变量
const fs = require('fs');
const path = require('path');

// 读取.env.local文件
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log('✅ 已加载 .env.local 文件');
} else {
  console.log('⚠️  未找到 .env.local 文件');
}

// 测试Supabase环境变量
console.log('\n=== 环境变量测试 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');

// 测试Supabase客户端创建
try {
  // 由于TypeScript模块需要特殊处理，我们直接测试环境变量
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n✅ Supabase 环境变量配置完整');
  } else {
    console.log('\n❌ Supabase 环境变量配置不完整');
  }
} catch (error) {
  console.log('❌ 测试失败:', error.message);
}