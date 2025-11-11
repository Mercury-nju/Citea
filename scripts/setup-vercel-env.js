const fs = require('fs');
const path = require('path');

// 读取本地环境变量
require('dotenv').config({ path: '.env.local' });

function generateVercelEnvSetup() {
  console.log('=== Vercel环境变量配置清单 ===\n');
  
  const envVars = [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      description: 'Supabase项目URL',
      required: true
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      description: 'Supabase匿名密钥',
      required: true
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      description: 'Supabase服务角色密钥',
      required: true
    },
    {
      key: 'REDIS_URL',
      value: process.env.REDIS_URL,
      description: 'Redis连接字符串',
      required: true
    },
    {
      key: 'JWT_SECRET',
      value: process.env.JWT_SECRET,
      description: 'JWT签名密钥',
      required: true
    },
    {
      key: 'NODE_ENV',
      value: 'production',
      description: '生产环境标识',
      required: false
    }
  ];
  
  console.log('📋 需要在Vercel中配置的环境变量：\n');
  
  envVars.forEach(env => {
    if (env.required) {
      if (env.value) {
        console.log(`✅ ${env.key}`);
        console.log(`   描述: ${env.description}`);
        console.log(`   值: ${env.value.substring(0, 30)}...`);
        console.log('');
      } else {
        console.log(`❌ ${env.key} - 缺失！`);
        console.log(`   描述: ${env.description}`);
        console.log('');
      }
    }
  });
  
  // 生成Vercel CLI命令
  console.log('🚀 快速配置命令（使用Vercel CLI）：\n');
  console.log('vercel env add NEXT_PUBLIC_SUPABASE_URL production');
  console.log('vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production');
  console.log('vercel env add SUPABASE_SERVICE_ROLE_KEY production');
  console.log('vercel env add REDIS_URL production');
  console.log('vercel env add JWT_SECRET production');
  console.log('vercel env add NODE_ENV production');
  
  console.log('\n📖 手动配置步骤：');
  console.log('1. 访问 https://vercel.com/dashboard');
  console.log('2. 找到你的项目并点击进入');
  console.log('3. 点击 Settings 选项卡');
  console.log('4. 在左侧菜单选择 Environment Variables');
  console.log('5. 添加上述所有环境变量');
  console.log('6. 重新部署项目');
  
  // 创建配置文件
  const configContent = `# Vercel环境变量配置
# 复制这些变量到Vercel的Environment Variables设置中

${envVars.map(env => `${env.key}=${env.value || ''}`).join('\n')}
`;
  
  fs.writeFileSync('vercel-env-config.txt', configContent);
  console.log('\n✅ 配置已保存到 vercel-env-config.txt 文件');
  
  return envVars.every(env => !env.required || env.value);
}

// 执行检查
const allConfigured = generateVercelEnvSetup();

if (allConfigured) {
  console.log('\n🎉 所有必需的环境变量都已准备好！');
  console.log('现在可以安全地部署到Vercel了。');
} else {
  console.log('\n⚠️  缺少必需的环境变量，请先配置完整。');
  process.exit(1);
}