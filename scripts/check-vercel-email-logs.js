/**
 * 检查 Vercel 部署日志中的邮件发送相关日志
 * 使用 Vercel API 获取最新的运行时日志
 */

const https = require('https')

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.argv[2]
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'mercury-njus-projects'
const PROJECT_NAME = 'citea'

if (!VERCEL_TOKEN) {
  console.error('❌ 请提供 Vercel Token')
  console.log('使用方法: node scripts/check-vercel-email-logs.js <VERCEL_TOKEN>')
  process.exit(1)
}

async function checkEmailLogs() {
  try {
    console.log('🔍 检查邮件发送日志...\n')
    
    // 1. 获取项目
    const project = await vercelApiRequest(`/v9/projects/${PROJECT_NAME}?teamId=${VERCEL_TEAM_ID}`)
    console.log(`📦 项目: ${project.name} (${project.id})\n`)
    
    // 2. 获取最新部署
    const deployments = await vercelApiRequest(`/v6/deployments?projectId=${project.id}&teamId=${VERCEL_TEAM_ID}&limit=1`)
    
    if (!deployments.deployments || deployments.deployments.length === 0) {
      console.log('❌ 没有找到部署')
      return
    }
    
    const deployment = deployments.deployments[0]
    console.log(`🚀 最新部署: ${deployment.uid}`)
    console.log(`   URL: https://${deployment.url}`)
    console.log(`   状态: ${deployment.readyState}`)
    console.log(`   创建时间: ${new Date(deployment.createdAt).toLocaleString()}\n`)
    
    // 3. 检查环境变量
    const envVars = await vercelApiRequest(`/v9/projects/${PROJECT_NAME}/env?teamId=${VERCEL_TEAM_ID}`)
    const brevoKey = envVars.find((v) => v.key === 'BREVO_API_KEY')
    
    console.log('🔑 BREVO_API_KEY 配置:')
    if (brevoKey) {
      console.log(`   ✅ 已配置`)
      console.log(`   值: ${brevoKey.value.substring(0, 15)}...`)
      console.log(`   格式: ${brevoKey.value.startsWith('xkeysib-') ? '✅ 正确' : '❌ 可能不正确'}`)
      console.log(`   环境: ${brevoKey.target.join(', ')}\n`)
    } else {
      console.log('   ❌ 未配置\n')
      console.log('💡 这就是问题所在！BREVO_API_KEY 未配置，邮件无法发送。')
      console.log('   解决方案:')
      console.log('   1. 访问 https://app.brevo.com/settings/keys/api')
      console.log('   2. 生成新的 API Key')
      console.log('   3. 在 Vercel 项目设置中添加环境变量 BREVO_API_KEY')
      console.log('   4. 重新部署应用\n')
      return
    }
    
    // 4. 获取 Functions 日志（运行时日志）
    console.log('📋 获取运行时日志...\n')
    console.log('💡 提示：Vercel API 可能无法直接获取 Functions 日志')
    console.log('   请访问 Vercel Dashboard 查看详细日志：')
    console.log(`   https://vercel.com/${VERCEL_TEAM_ID}/${PROJECT_NAME}/deployments/${deployment.uid}`)
    console.log('   然后点击 "Functions" → "/api/auth/signup" → 查看日志\n')
    
    // 5. 尝试通过日志 API 获取（可能不可用）
    try {
      // 注意：Vercel 的日志 API 可能有限制，这里只是尝试
      console.log('🔍 尝试获取部署事件...\n')
      // 这个 API 端点可能不存在或需要不同的权限
    } catch (error) {
      console.log('⚠️ 无法通过 API 获取日志，这是正常的')
      console.log('   请直接在 Vercel Dashboard 中查看日志\n')
    }
    
    // 6. 提供诊断建议
    console.log('💡 诊断步骤:\n')
    console.log('1. 检查 Vercel Dashboard 日志:')
    console.log(`   https://vercel.com/${VERCEL_TEAM_ID}/${PROJECT_NAME}`)
    console.log('   → Deployments → 最新部署 → Functions → /api/auth/signup\n')
    
    console.log('2. 查找以下关键词:')
    console.log('   - [Email] - 邮件发送相关')
    console.log('   - [Signup] - 注册相关')
    console.log('   - BREVO_API_KEY - API Key 配置')
    console.log('   - 邮件发送失败 - 错误信息\n')
    
    console.log('3. 使用诊断 API 测试:')
    console.log('   https://citea.cc/api/test/email-diagnosis?email=your-email@example.com\n')
    
    console.log('4. 检查 Brevo 控制台:')
    console.log('   https://app.brevo.com/')
    console.log('   → 查看发送日志和配额使用情况\n')
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
    if (error.message.includes('401')) {
      console.error('   Vercel Token 无效或已过期')
      console.error('   请访问 https://vercel.com/account/tokens 生成新的 Token')
    } else if (error.message.includes('404')) {
      console.error('   项目未找到，请检查项目名称和 Team ID')
    }
    process.exit(1)
  }
}

function vercelApiRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data))
          } else {
            const errorData = JSON.parse(data)
            reject(new Error(`API 请求失败: ${res.statusCode} ${res.statusMessage}\n${JSON.stringify(errorData, null, 2)}`))
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}\n响应数据: ${data.substring(0, 500)}`))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.end()
  })
}

checkEmailLogs().catch(console.error)

