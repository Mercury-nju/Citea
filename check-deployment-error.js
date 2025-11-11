const axios = require('axios');

async function getDeploymentError() {
  console.log('🔍 获取部署错误详情...\n');
  
  try {
    // 获取最新部署的详细信息
    const response = await axios.get('https://api.vercel.com/v13/deployments/b00bb0e4', {
      headers: { Authorization: 'Bearer DOeT5aq1WudVfmaSm1SMsjas' }
    });
    
    const deployment = response.data;
    
    console.log('🎯 部署错误详情:');
    console.log('状态:', deployment.state);
    console.log('错误:', deployment.errorMessage || '无具体错误信息');
    console.log('构建状态:', deployment.build?.state);
    console.log('准备状态:', deployment.readyState);
    
    if (deployment.build?.checks) {
      console.log('构建检查:');
      deployment.build.checks.forEach(check => {
        console.log(`  - ${check.type}: ${check.conclusion}`);
      });
    }
    
    // 获取构建日志
    console.log('\n📋 获取构建日志...');
    const logsResponse = await axios.get(`https://api.vercel.com/v1/deployments/${deployment.id}/events`, {
      headers: { Authorization: 'Bearer DOeT5aq1WudVfmaSm1SMsjas' }
    });
    
    const errorEvents = logsResponse.data.events.filter(event => 
      event.type === 'error' || event.payload?.text?.includes('error')
    );
    
    if (errorEvents.length > 0) {
      console.log('错误事件:');
      errorEvents.slice(0, 5).forEach(event => {
        console.log(`  ${new Date(event.createdAt).toLocaleTimeString()}: ${event.payload?.text}`);
      });
    }
    
  } catch (error) {
    console.error('获取错误详情失败:', error.response?.data?.error?.message || error.message);
  }
}

getDeploymentError();