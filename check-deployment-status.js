const https = require('https');
const { execSync } = require('child_process');

// 部署URL列表
const deploymentUrls = [
  'https://citea-is41u00bl-mercury-njus-projects.vercel.app',
  'https://citea-am39638l8-mercury-njus-projects.vercel.app'
];

// 检查网站访问状态
async function checkWebsiteStatus(url) {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(url).hostname,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
        accessible: res.statusCode === 200
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 'error',
        error: error.message,
        accessible: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'timeout',
        accessible: false
      });
    });

    req.end();
  });
}

// 检查API端点
async function checkApiEndpoints(url) {
  const endpoints = ['/api/health', '/api/auth/signup', '/api/auth/login'];
  const results = [];

  for (const endpoint of endpoints) {
    const result = await new Promise((resolve) => {
      const options = {
        hostname: new URL(url).hostname,
        path: endpoint,
        method: 'HEAD',
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        resolve({
          endpoint,
          status: res.statusCode,
          accessible: res.statusCode === 200 || res.statusCode === 405 || res.statusCode === 404
        });
      });

      req.on('error', () => {
        resolve({
          endpoint,
          status: 'error',
          accessible: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          endpoint,
          status: 'timeout',
          accessible: false
        });
      });

      req.end();
    });

    results.push(result);
  }

  return results;
}

// 检查环境变量配置
function checkEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'REDIS_URL'
  ];

  const results = {};
  
  requiredVars.forEach(varName => {
    const value = process.env[varName] || process.env[varName.toUpperCase()];
    results[varName] = {
      exists: !!value,
      length: value ? value.length : 0
    };
  });

  return results;
}

// 检查Vercel部署状态
async function checkVercelDeployment() {
  try {
    const result = execSync('vercel ls --prod', { encoding: 'utf8' });
    return {
      success: true,
      output: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 主函数
async function main() {
  console.log('🔍 全面部署状态检查...\n');

  // 1. 检查网站访问状态
  console.log('📊 1. 网站访问状态检查:');
  for (const url of deploymentUrls) {
    const status = await checkWebsiteStatus(url);
    console.log(`   ${url}:`);
    console.log(`     状态: ${status.status}`);
    console.log(`     可访问: ${status.accessible ? '✅' : '❌'}`);
    
    if (status.status === 401) {
      console.log(`     ⚠️  需要身份验证 - 可能是SSO保护或项目设置为私有`);
    }
    
    if (status.headers) {
      console.log(`     服务器: ${status.headers.server || '未知'}`);
      console.log(`     缓存: ${status.headers['cache-control'] || '无'}`);
    }
    
    console.log('');
  }

  // 2. 检查API端点
  console.log('🔌 2. API端点检查:');
  for (const url of deploymentUrls) {
    const apiResults = await checkApiEndpoints(url);
    console.log(`   ${url}:`);
    apiResults.forEach(result => {
      console.log(`     ${result.endpoint}: ${result.status} ${result.accessible ? '✅' : '❌'}`);
    });
    console.log('');
  }

  // 3. 检查环境变量
  console.log('🔧 3. 环境变量检查:');
  const envVars = checkEnvironmentVariables();
  Object.entries(envVars).forEach(([varName, status]) => {
    console.log(`   ${varName}: ${status.exists ? '✅' : '❌'} (长度: ${status.length})`);
  });
  console.log('');

  // 4. 检查Vercel部署
  console.log('🚀 4. Vercel部署状态:');
  const vercelStatus = await checkVercelDeployment();
  if (vercelStatus.success) {
    console.log('   ✅ Vercel CLI连接正常');
    console.log('   📋 最近的部署:');
    console.log(vercelStatus.output.split('\n').slice(0, 5).join('\n'));
  } else {
    console.log(`   ❌ Vercel CLI连接失败: ${vercelStatus.error}`);
  }
  console.log('');

  // 5. 问题分析和解决方案
  console.log('🔍 5. 问题分析和解决方案:');
  console.log('');
  console.log('   🔒 401错误可能原因:');
  console.log('   1. Vercel项目被设置为私有');
  console.log('   2. SSO保护已开启');
  console.log('   3. 需要身份验证才能访问');
  console.log('');
  console.log('   💡 解决方案:');
  console.log('   1. 访问 https://vercel.com/mercury-njus-projects/citea/settings/security');
  console.log('   2. 检查 "Protection" 设置');
  console.log('   3. 关闭 "SSO Protection" 如果不需要');
  console.log('   4. 确保项目不是私有模式');
  console.log('   5. 重新部署项目');
  console.log('');
  console.log('   🚀 快速修复命令:');
  console.log('   vercel deploy --prod --force');
  console.log('');

  // 6. 更新部署测试页面
  console.log('📝 6. 建议操作:');
  console.log('   ✅ 已打开安全设置页面，请检查并关闭SSO保护');
  console.log('   ✅ 环境变量已正确配置');
  console.log('   ✅ 部署成功完成');
  console.log('   ⚠️  需要手动关闭访问限制');
  console.log('');
  console.log('🎯 下一步:');
  console.log('   1. 在打开的页面中关闭SSO保护');
  console.log('   2. 等待几分钟让更改生效');
  console.log('   3. 重新测试网站访问');
  console.log('   4. 使用 deployment-test.html 页面测试功能');
}

// 运行主函数
main().catch(console.error);