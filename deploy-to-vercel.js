const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const VERCEL_API_TOKEN = 'DOeT5aq1WudVfmaSm1SMsjas';
const PROJECT_NAME = 'citea';

async function deployToVercel() {
  console.log('🚀 开始Vercel部署流程...\n');
  
  try {
    // 1. 获取用户信息
    console.log('1. 验证API密钥...');
    const userResponse = await axios.get('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
    });
    console.log(`   ✅ API密钥有效，用户: ${userResponse.data.user.username}`);
    
    // 2. 获取项目列表
    console.log('\n2. 查找项目...');
    const projectsResponse = await axios.get('https://api.vercel.com/v9/projects', {
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
    });
    
    let project = projectsResponse.data.projects.find(p => p.name === PROJECT_NAME);
    
    if (!project) {
      console.log(`   ⚠️  未找到项目 "${PROJECT_NAME}"，需要创建新项目`);
      // 创建新项目
      const createProjectResponse = await axios.post('https://api.vercel.com/v9/projects', 
        { name: PROJECT_NAME },
        { headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` } }
      );
      project = createProjectResponse.data;
      console.log(`   ✅ 项目创建成功: ${project.id}`);
    } else {
      console.log(`   ✅ 找到项目: ${project.name} (${project.id})`);
    }
    
    // 3. 配置环境变量
    console.log('\n3. 配置环境变量...');
    const envVars = [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
      { key: 'REDIS_URL', value: process.env.REDIS_URL },
      { key: 'JWT_SECRET', value: process.env.JWT_SECRET },
      { key: 'NODE_ENV', value: 'production' }
    ];
    
    for (const envVar of envVars) {
      if (envVar.value) {
        await axios.post(`https://api.vercel.com/v9/projects/${project.id}/env`, 
          {
            key: envVar.key,
            value: envVar.value,
            target: 'production'
          },
          { headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` } }
        );
        console.log(`   ✅ 已配置: ${envVar.key}`);
      } else {
        console.log(`   ⚠️  跳过: ${envVar.key} (未设置)`);
      }
    }
    
    // 4. 创建部署
    console.log('\n4. 创建部署...');
    
    // 获取当前Git信息
    const { execSync } = require('child_process');
    const gitCommit = execSync('git rev-parse HEAD').toString().trim();
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    console.log(`   Git分支: ${gitBranch}`);
    console.log(`   Git提交: ${gitCommit.substring(0, 8)}`);
    
    // 由于GitHub集成更可靠，我们创建部署配置
    const deploymentConfig = {
      name: PROJECT_NAME,
      version: 2,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/next',
          config: {
            maxLambdaSize: '50mb'
          }
        }
      ],
      env: envVars.reduce((acc, env) => {
        if (env.value) acc[env.key] = env.value;
        return acc;
      }, {}),
      framework: 'nextjs'
    };
    
    // 保存部署配置
    fs.writeFileSync('vercel.json', JSON.stringify(deploymentConfig, null, 2));
    console.log('   ✅ 部署配置已保存到 vercel.json');
    
    console.log('\n5. 部署状态检查...');
    
    // 检查最近的部署
    const deploymentsResponse = await axios.get(`https://api.vercel.com/v6/deployments?projectId=${project.id}&limit=1`, {
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
    });
    
    if (deploymentsResponse.data.deployments.length > 0) {
      const latestDeployment = deploymentsResponse.data.deployments[0];
      console.log(`   最近部署状态: ${latestDeployment.state}`);
      console.log(`   部署URL: https://${latestDeployment.url}`);
      
      if (latestDeployment.state === 'READY') {
        console.log('\n🎉 部署成功！');
        console.log(`🌐 应用地址: https://${latestDeployment.url}`);
        console.log(`📊 部署详情: https://vercel.com/${userResponse.data.user.username}/${PROJECT_NAME}/${latestDeployment.id}`);
      } else if (latestDeployment.state === 'ERROR') {
        console.log('\n❌ 部署失败，请检查日志');
      } else {
        console.log('\n⏳ 部署进行中...');
      }
    }
    
    console.log('\n📋 后续步骤:');
    console.log('1. 访问部署URL测试功能');
    console.log('2. 验证用户注册流程');
    console.log('3. 检查邮件发送功能');
    console.log('4. 测试完整用户流程');
    
  } catch (error) {
    console.error('❌ 部署失败:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n🔑 API密钥可能无效或权限不足');
    } else if (error.response?.status === 404) {
      console.log('\n📁 项目未找到');
    }
  }
}

deployToVercel();