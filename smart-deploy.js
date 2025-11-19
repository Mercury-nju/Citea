const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const VERCEL_API_TOKEN = 'DOeT5aq1WudVfmaSm1SMsjas';
const PROJECT_NAME = 'citea';

async function smartDeploy() {
  console.log('🚀 开始智能Vercel部署...\n');
  
  try {
    // 1. 验证API密钥
    console.log('1. 验证API密钥...');
    const userResponse = await axios.get('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
    });
    console.log(`   ✅ API密钥有效，用户: ${userResponse.data.user.username}`);
    
    // 2. 获取项目信息
    console.log('\n2. 获取项目信息...');
    const projectsResponse = await axios.get('https://api.vercel.com/v9/projects', {
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
    });
    
    const project = projectsResponse.data.projects.find(p => p.name === PROJECT_NAME);
    
    if (!project) {
      console.log(`   ❌ 未找到项目 "${PROJECT_NAME}"`);
      console.log('   📋 请先在Vercel网站创建项目或连接GitHub仓库');
      return;
    }
    
    console.log(`   ✅ 找到项目: ${project.name} (${project.id})`);
    console.log(`   🌐 项目URL: https://${project.name}.vercel.app`);
    
    // 3. 检查现有环境变量
    console.log('\n3. 检查环境变量配置...');
    const envResponse = await axios.get(`https://api.vercel.com/v9/projects/${project.id}/env`, {
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` }
    });
    
    const existingEnvVars = envResponse.data.envs || [];
    console.log(`   已配置 ${existingEnvVars.length} 个环境变量`);
    
    // 4. 需要配置的环境变量
    const requiredEnvVars = [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
      { key: 'REDIS_URL', value: process.env.REDIS_URL },
      { key: 'JWT_SECRET', value: process.env.JWT_SECRET },
      { key: 'NODE_ENV', value: 'production' }
    ];
    
    let envUpdateCount = 0;
    for (const envVar of requiredEnvVars) {
      if (envVar.value) {
        const exists = existingEnvVars.some(env => env.key === envVar.key);
        if (!exists) {
          try {
            await axios.post(`https://api.vercel.com/v9/projects/${project.id}/env`, 
              {
                key: envVar.key,
                value: envVar.value,
                target: ['production', 'preview', 'development']
              },
              { headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` } }
            );
            console.log(`   ✅ 已添加: ${envVar.key}`);
            envUpdateCount++;
          } catch (error) {
            console.log(`   ⚠️  添加失败: ${envVar.key} - ${error.response?.data?.error?.message || error.message}`);
          }
        } else {
          console.log(`   ℹ️  已存在: ${envVar.key}`);
        }
      }
    }
    
    if (envUpdateCount > 0) {
      console.log(`   📝 更新了 ${envUpdateCount} 个环境变量`);
    }
    
    // 5. 触发重新部署
    console.log('\n4. 触发重新部署...');
    
    // 创建触发文件来强制重新部署
    const triggerContent = `# 部署触发文件
# 生成时间: ${new Date().toISOString()}
# 触发原因: 环境变量更新和代码部署
SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置'}
ENV_UPDATED=${envUpdateCount > 0 ? '是' : '否'}
`;
    
    require('fs').writeFileSync('deployment-trigger.txt', triggerContent);
    console.log('   ✅ 创建部署触发文件');
    
    // 6. 提供部署指导
    console.log('\n📋 部署指导:');
    console.log('   1. 执行以下命令推送到GitHub:');
    console.log('      git add .');
    console.log('      git commit -m "更新环境变量和部署配置"');
    console.log('      git push origin main');
    console.log('');
    console.log('   2. Vercel会自动检测到推送并重新部署');
    console.log('   3. 访问以下URL查看部署状态:');
    console.log(`      https://vercel.com/${userResponse.data.user.username}/${PROJECT_NAME}/deployments`);
    console.log('');
    console.log('   4. 部署完成后测试以下功能:');
    console.log(`      - 网站访问: https://${PROJECT_NAME}.vercel.app`);
    console.log('      - 用户注册流程');
    console.log('      - 邮件发送功能');
    console.log('      - 邮箱验证流程');
    
    // 7. 检查最近的部署状态
    console.log('\n5. 检查最近部署状态...');
    try {
      const deploymentsResponse = await axios.get(
        `https://api.vercel.com/v6/deployments?projectId=${project.id}&limit=1`,
        { headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` } }
      );
      
      if (deploymentsResponse.data.deployments.length > 0) {
        const latestDeployment = deploymentsResponse.data.deployments[0];
        console.log(`   最近部署: ${latestDeployment.state}`);
        console.log(`   部署时间: ${new Date(latestDeployment.createdAt).toLocaleString()}`);
        
        if (latestDeployment.state === 'READY') {
          console.log(`   ✅ 部署成功: https://${latestDeployment.url}`);
        } else if (latestDeployment.state === 'ERROR') {
          console.log('   ❌ 部署失败');
        } else {
          console.log('   ⏳ 部署进行中');
        }
      }
    } catch (error) {
      console.log('   ⚠️  无法获取部署状态');
    }
    
    console.log('\n🎯 下一步操作:');
    console.log('1. 执行Git推送命令');
    console.log('2. 等待Vercel自动部署');
    console.log('3. 测试生产环境功能');
    console.log('4. 验证用户注册流程');
    
  } catch (error) {
    console.error('❌ 操作失败:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n🔑 API密钥无效或权限不足');
    } else if (error.response?.status === 404) {
      console.log('\n📁 项目未找到');
    }
  }
}

smartDeploy();