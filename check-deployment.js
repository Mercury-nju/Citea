const axios = require('axios');

async function checkDeploymentStatus() {
  console.log('🔍 检查Vercel部署状态...\n');
  
  try {
    const response = await axios.get('https://api.vercel.com/v6/deployments', {
      headers: { Authorization: 'Bearer DOeT5aq1WudVfmaSm1SMsjas' },
      params: { projectId: 'prj_OoP4mWaZW1YUyHktTAhjEibBVGOz', limit: 5 }
    });
    
    const deployments = response.data.deployments;
    console.log('📊 最近部署记录:\n');
    
    deployments.forEach((deployment, index) => {
      console.log(`${index + 1}. ${deployment.state} - ${new Date(deployment.createdAt).toLocaleString()}`);
      console.log(`   URL: https://${deployment.url}`);
      console.log(`   提交: ${deployment.meta?.githubCommitSha?.substring(0, 8) || 'N/A'}`);
      console.log('');
    });
    
    const latest = deployments[0];
    if (latest) {
      console.log(`🎯 最新部署状态: ${latest.state}`);
      
      if (latest.state === 'READY') {
        console.log(`🎉 部署成功！访问: https://${latest.url}`);
        console.log('✅ 现在可以测试用户注册功能了！');
        
        // 测试网站访问
        console.log('\n🧪 测试网站访问...');
        testWebsiteAccess(latest.url);
        
      } else if (latest.state === 'BUILDING') {
        console.log('⏳ 正在构建中，请等待...');
      } else if (latest.state === 'ERROR') {
        console.log('❌ 部署失败，需要检查错误日志');
        console.log('📋 查看日志: https://vercel.com/mercury-nju/citea/deployments');
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.response?.data?.error?.message || error.message);
  }
}

async function testWebsiteAccess(url) {
  try {
    const response = await axios.get(`https://${url}`, { timeout: 10000 });
    console.log(`✅ 网站访问正常: ${response.status}`);
    
    if (response.status === 200) {
      console.log('\n🎯 下一步:');
      console.log('1. 访问 https://citea.vercel.app');
      console.log('2. 测试用户注册流程');
      console.log('3. 验证邮件发送功能');
      console.log('4. 确保用户能收到验证码');
    }
  } catch (error) {
    console.log(`⚠️  网站访问测试失败: ${error.message}`);
  }
}

checkDeploymentStatus();