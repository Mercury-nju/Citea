const { execSync } = require('child_process');
const https = require('https');

// Vercel API配置
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
const PROJECT_ID = 'prj_OoP4mWaZW1YUyHktTAhjEibBVGOz';

if (!VERCEL_API_TOKEN) {
  console.log('❌ 需要设置VERCEL_API_TOKEN环境变量');
  console.log('💡 获取方式：');
  console.log('1. 访问 https://vercel.com/account/tokens');
  console.log('2. 创建新的API Token');
  console.log('3. 设置环境变量：set VERCEL_API_TOKEN=your_token_here');
  process.exit(1);
}

// 关闭SSO保护的函数
async function disableSSOProtection() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_ID}/protection`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const data = JSON.stringify({
      protection: {
        sso: {
          enabled: false
        }
      }
    });

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ SSO保护已关闭');
          resolve(JSON.parse(responseData));
        } else {
          console.log(`❌ 关闭SSO保护失败: ${res.statusCode}`);
          console.log('响应:', responseData);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ API请求失败:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// 检查项目当前状态
async function checkProjectStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_ID}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const project = JSON.parse(responseData);
          console.log('📊 项目当前状态:');
          console.log(`   名称: ${project.name}`);
          console.log(`   框架: ${project.framework}`);
          console.log(`   公开访问: ${project.publicSource ? '是' : '否'}`);
          
          if (project.protection) {
            console.log(`   SSO保护: ${project.protection.sso?.enabled ? '开启' : '关闭'}`);
          }
          
          resolve(project);
        } else {
          console.log(`❌ 获取项目状态失败: ${res.statusCode}`);
          console.log('响应:', responseData);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ API请求失败:', error.message);
      reject(error);
    });

    req.end();
  });
}

// 主函数
async function main() {
  console.log('🔧 开始配置Vercel项目...');
  
  try {
    // 检查当前状态
    await checkProjectStatus();
    
    console.log('\n🔓 正在关闭SSO保护...');
    await disableSSOProtection();
    
    console.log('\n✅ 配置完成！');
    console.log('🔄 请等待几分钟让更改生效，然后重新测试网站访问。');
    
  } catch (error) {
    console.log('\n❌ 配置失败:', error.message);
    console.log('💡 替代方案:');
    console.log('1. 访问 https://vercel.com/dashboard');
    console.log('2. 找到 citea 项目');
    console.log('3. 进入 Settings > Security');
    console.log('4. 关闭 SSO Protection');
  }
}

// 运行主函数
main();