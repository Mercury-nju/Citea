/**
 * 检查邮件配置和环境变量
 * 使用 Vercel API 检查 BREVO_API_KEY 配置
 */

const https = require('https')

// 从环境变量或命令行参数获取 Vercel Token
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.argv[2]
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'mercury-njus-projects'
const PROJECT_NAME = 'citea'

if (!VERCEL_TOKEN) {
  console.error('❌ 请提供 Vercel Token')
  console.log('使用方法: node scripts/check-email-config.js <VERCEL_TOKEN>')
  console.log('或者设置环境变量: export VERCEL_TOKEN=your_token')
  process.exit(1)
}

async function checkVercelEnv() {
  try {
    console.log('🔍 检查 Vercel 环境变量配置...\n')
    
    // 1. 获取项目信息
    const project = await vercelApiRequest(`/v9/projects/${PROJECT_NAME}?teamId=${VERCEL_TEAM_ID}`)
    console.log('📦 项目信息:')
    console.log(`   名称: ${project.name}`)
    console.log(`   项目 ID: ${project.id}\n`)
    
    // 2. 获取环境变量
    const envVars = await vercelApiRequest(`/v9/projects/${PROJECT_NAME}/env?teamId=${VERCEL_TEAM_ID}`)
    console.log('🔑 环境变量配置:\n')
    
    const brevoKey = envVars.find((v: any) => v.key === 'BREVO_API_KEY')
    const brevoEmail = envVars.find((v: any) => v.key === 'BREVO_FROM_EMAIL')
    const redisUrl = envVars.find((v: any) => v.key === 'REDIS_URL')
    
    // 检查 BREVO_API_KEY
    if (brevoKey) {
      console.log('✅ BREVO_API_KEY:')
      console.log(`   已配置: ✅`)
      console.log(`   值: ${brevoKey.value.substring(0, 15)}...`)
      console.log(`   格式: ${brevoKey.value.startsWith('xkeysib-') ? '✅ 正确' : '❌ 可能不正确（应该以 xkeysib- 开头）'}`)
      console.log(`   环境: ${brevoKey.target.join(', ')}`)
      console.log(`   创建时间: ${new Date(brevoKey.createdAt).toLocaleString()}\n`)
    } else {
      console.log('❌ BREVO_API_KEY:')
      console.log('   未配置 ❌\n')
    }
    
    // 检查 BREVO_FROM_EMAIL
    if (brevoEmail) {
      console.log('✅ BREVO_FROM_EMAIL:')
      console.log(`   已配置: ✅`)
      console.log(`   值: ${brevoEmail.value}`)
      console.log(`   环境: ${brevoEmail.target.join(', ')}\n`)
    } else {
      console.log('⚠️ BREVO_FROM_EMAIL:')
      console.log('   未配置（将使用默认值: lihongyangnju@gmail.com）\n')
    }
    
    // 检查 REDIS_URL
    if (redisUrl) {
      console.log('✅ REDIS_URL:')
      console.log(`   已配置: ✅`)
      console.log(`   类型: ${redisUrl.value.startsWith('rediss://') ? 'SSL' : redisUrl.value.startsWith('redis://') ? 'Standard' : 'Unknown'}`)
      console.log(`   环境: ${redisUrl.target.join(', ')}\n`)
    } else {
      console.log('⚠️ REDIS_URL:')
      console.log('   未配置\n')
    }
    
    // 3. 获取最新的部署
    console.log('📊 获取最新部署信息...\n')
    const deployments = await vercelApiRequest(`/v6/deployments?projectId=${project.id}&teamId=${VERCEL_TEAM_ID}&limit=5`)
    
    if (deployments.deployments && deployments.deployments.length > 0) {
      const latestDeployment = deployments.deployments[0]
      console.log('🚀 最新部署:')
      console.log(`   URL: https://${latestDeployment.url}`)
      console.log(`   状态: ${latestDeployment.readyState}`)
      console.log(`   创建时间: ${new Date(latestDeployment.createdAt).toLocaleString()}`)
      console.log(`   环境: ${latestDeployment.target || 'production'}\n`)
      
      // 4. 获取部署日志（运行时日志）
      console.log('📋 获取部署日志...\n')
      try {
        const logs = await vercelApiRequest(`/v2/deployments/${latestDeployment.uid}/events?teamId=${VERCEL_TEAM_ID}&limit=100`)
        
        // 查找邮件相关的日志
        const emailLogs = logs.filter((log: any) => 
          log.payload && (
            log.payload.text?.includes('[Email]') ||
            log.payload.text?.includes('[Signup]') ||
            log.payload.text?.includes('BREVO') ||
            log.payload.text?.includes('邮件') ||
            log.payload.text?.includes('verification')
          )
        )
        
        if (emailLogs.length > 0) {
          console.log('📧 邮件相关日志:')
          emailLogs.slice(-10).forEach((log: any) => {
            const timestamp = new Date(log.created).toLocaleString()
            const text = log.payload?.text || ''
            console.log(`   [${timestamp}] ${text.substring(0, 200)}`)
          })
        } else {
          console.log('⚠️ 没有找到邮件相关日志')
          console.log('   这可能意味着：')
          console.log('   1. 还没有用户尝试注册')
          console.log('   2. 日志还没有生成')
          console.log('   3. 需要查看 Vercel Dashboard 中的 Functions 日志\n')
        }
      } catch (logError) {
        console.log('⚠️ 无法获取部署日志:', logError.message)
        console.log('   请直接在 Vercel Dashboard 中查看日志\n')
      }
    }
    
    // 5. 诊断建议
    console.log('💡 诊断建议:\n')
    if (!brevoKey) {
      console.log('❌ BREVO_API_KEY 未配置')
      console.log('   解决方案:')
      console.log('   1. 访问 https://app.brevo.com/settings/keys/api')
      console.log('   2. 生成新的 API Key')
      console.log('   3. 在 Vercel 项目设置中添加环境变量 BREVO_API_KEY')
      console.log('   4. 重新部署应用\n')
    } else if (!brevoKey.value.startsWith('xkeysib-')) {
      console.log('⚠️ BREVO_API_KEY 格式可能不正确')
      console.log('   正确的格式应该以 xkeysib- 开头')
      console.log('   请检查 API Key 是否正确\n')
    } else {
      console.log('✅ BREVO_API_KEY 配置看起来正确')
      console.log('   如果邮件仍然没有发送，请检查：')
      console.log('   1. API Key 是否在 Brevo 控制台中有效')
      console.log('   2. 发件邮箱是否已在 Brevo 中验证')
      console.log('   3. Brevo 配额是否已用完（免费账户每日 300 封）')
      console.log('   4. 查看 Vercel Dashboard 中的 Functions 日志获取详细错误信息\n')
    }
    
    // 6. 测试邮件发送 API
    console.log('🧪 测试邮件发送 API:')
    console.log(`   访问: https://citea.cc/api/test/email-diagnosis?email=your-email@example.com`)
    console.log('   这将测试邮件发送功能并返回详细的诊断信息\n')
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
    if (error.response) {
      console.error('   响应:', error.response)
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
            reject(new Error(`API 请求失败: ${res.statusCode} ${res.statusMessage}\n${data}`))
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}\n${data}`))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.end()
  })
}

// 运行检查
checkVercelEnv().catch(console.error)

