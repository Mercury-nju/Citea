const fs = require('fs');
const path = require('path');

async function analyzeDeploymentIssue() {
  console.log('🔍 分析部署401问题...\n');
  
  // 1. 检查项目配置
  console.log('1️⃣ 检查项目配置文件...');
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  
  if (fs.existsSync(vercelConfigPath)) {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    console.log('✅ vercel.json 存在');
    console.log('   配置:', JSON.stringify(config, null, 2));
  } else {
    console.log('⚠️  vercel.json 不存在');
  }
  
  // 2. 检查package.json
  console.log('\n2️⃣ 检查package.json...');
  const packagePath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log('   项目名称:', pkg.name);
  console.log('   版本:', pkg.version);
  console.log('   构建命令:', pkg.scripts?.build || '未定义');
  console.log('   启动命令:', pkg.scripts?.start || '未定义');
  
  // 3. 检查环境变量文件
  console.log('\n3️⃣ 检查环境变量文件...');
  const envFiles = ['.env', '.env.local', '.env.production'];
  
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} 存在`);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => 
        line.trim() && !line.startsWith('#')
      );
      console.log(`   包含 ${lines.length} 个环境变量`);
    } else {
      console.log(`⚠️  ${file} 不存在`);
    }
  });
  
  // 4. 分析401错误原因
  console.log('\n4️⃣ 分析401错误原因...');
  console.log('   可能的原因:');
  console.log('   🔒 Vercel项目设置为私有');
  console.log('   🔑 缺少环境变量配置');
  console.log('   🛡️  部署保护设置');
  console.log('   🔐 需要Vercel身份验证');
  
  // 5. 提供解决方案
  console.log('\n5️⃣ 解决方案...');
  console.log('   方案1: 配置Vercel环境变量');
  console.log('   - 访问 https://vercel.com/dashboard');
  console.log('   - 找到你的项目');
  console.log('   - 进入 Settings → Environment Variables');
  console.log('   - 添加所有必要的环境变量');
  
  console.log('\n   方案2: 检查项目可见性设置');
  console.log('   - 确保项目不是私有的');
  console.log('   - 检查部署保护设置');
  
  console.log('\n   方案3: 重新部署');
  console.log('   - 推送新的提交');
  console.log('   - 等待重新部署完成');
  console.log('   - 测试新的URL');
  
  // 6. 创建部署指南
  const deploymentGuide = `# 部署问题解决方案

## 问题：401 Unauthorized

### 原因分析
1. Vercel项目可能需要身份验证
2. 环境变量未正确配置
3. 项目设置为私有

### 解决方案

#### 步骤1：配置Vercel环境变量
访问 https://vercel.com/dashboard 并添加以下环境变量：

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥
REDIS_URL=你的Redis连接URL
JWT_SECRET=你的JWT密钥
\`\`\`

#### 步骤2：检查项目设置
确保项目不是私有的，检查部署保护设置。

#### 步骤3：重新部署
推送新的提交触发重新部署。

### 测试部署
部署成功后，访问提供的URL测试功能。
`;

  fs.writeFileSync('DEPLOYMENT_FIX_GUIDE.md', deploymentGuide);
  console.log('\n✅ 已创建部署修复指南: DEPLOYMENT_FIX_GUIDE.md');
  
  // 7. 创建环境变量配置脚本
  const envConfigScript = `#!/bin/bash
# Vercel环境变量配置脚本

echo "🚀 配置Vercel环境变量..."

# 检查是否已登录Vercel
if ! vercel whoami; then
    echo "请先登录Vercel:"
    vercel login
fi

# 读取本地环境变量
if [ -f .env.local ]; then
    echo "发现 .env.local 文件，开始配置..."
    
    # 逐行读取并设置环境变量
    while IFS= read -r line; do
        # 跳过空行和注释
        if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
            # 提取变量名和值
            key=$(echo "$line" | cut -d'=' -f1)
            value=$(echo "$line" | cut -d'=' -f2-)
            
            # 设置环境变量
            echo "设置: $key"
            echo "$value" | vercel env add "$key" production
        fi
    done < .env.local
    
    echo "✅ 环境变量配置完成！"
    echo "请重新部署项目："
    echo "git push origin main"
else
    echo "❌ 未找到 .env.local 文件"
fi
`;

  fs.writeFileSync('setup-vercel-env.sh', envConfigScript);
  console.log('✅ 已创建环境变量配置脚本: setup-vercel-env.sh');
  
  console.log('\n📋 总结:');
  console.log('✅ 问题分析完成');
  console.log('✅ 解决方案已提供');
  console.log('✅ 相关脚本已创建');
  console.log('\n🎯 下一步:');
  console.log('1. 检查DEPLOYMENT_FIX_GUIDE.md');
  console.log('2. 运行 setup-vercel-env.sh 配置环境变量');
  console.log('3. 重新部署项目');
  console.log('4. 测试新的部署URL');
}

analyzeDeploymentIssue().catch(console.error);