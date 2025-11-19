/**
 * 检查生产环境邮件配置
 * 直接调用生产环境的诊断 API
 */

const https = require('https')

const PRODUCTION_URL = 'https://citea.cc'
const TEST_EMAIL = process.argv[2] || 'test@example.com'

async function checkProductionEmail() {
  try {
    console.log('🔍 检查生产环境邮件配置...\n')
    console.log(`🌐 生产环境 URL: ${PRODUCTION_URL}\n`)
    
    // 1. 检查环境变量 API
    console.log('1️⃣ 检查环境变量配置...\n')
    try {
      const envData = await httpRequest(`${PRODUCTION_URL}/api/test-env`)
      console.log('✅ 环境变量状态:')
      console.log(`   环境: ${envData.environment}`)
      console.log(`   BREVO_API_KEY: ${envData.email?.hasBrevo ? '✅ 已配置' : '❌ 未配置'}`)
      if (envData.email?.brevoKeyPrefix) {
        console.log(`   API Key 前缀: ${envData.email.brevoKeyPrefix}`)
        console.log(`   API Key 格式: ${envData.email.brevoKeyFormat}`)
      }
      console.log(`   发件邮箱: ${envData.email?.fromEmail || '未配置'}\n`)
      
      if (!envData.email?.hasBrevo) {
        console.log('❌ 问题发现: BREVO_API_KEY 未配置！')
        console.log('   这就是邮件无法发送的原因。\n')
        console.log('💡 解决方案:')
        console.log('   1. 访问 https://app.brevo.com/settings/keys/api')
        console.log('   2. 生成新的 API Key')
        console.log('   3. 在 Vercel 项目设置中添加环境变量 BREVO_API_KEY')
        console.log('   4. 重新部署应用\n')
        return
      }
    } catch (error) {
      console.error('❌ 无法检查环境变量:', error.message)
      console.log('   可能的原因: API 路由不可用或需要认证\n')
    }
    
    // 2. 测试邮件发送（如果提供了测试邮箱）
    if (TEST_EMAIL && TEST_EMAIL !== 'test@example.com') {
      console.log(`2️⃣ 测试邮件发送到 ${TEST_EMAIL}...\n`)
      try {
        const diagnosis = await httpRequest(`${PRODUCTION_URL}/api/test/email-diagnosis?email=${encodeURIComponent(TEST_EMAIL)}`)
        
        console.log('✅ 诊断结果:')
        console.log(`   环境: ${diagnosis.environment?.vercelEnv || 'unknown'}`)
        console.log(`   BREVO_API_KEY: ${diagnosis.environment?.hasBrevoKey ? '✅ 已配置' : '❌ 未配置'}`)
        if (diagnosis.environment?.brevoKeyPrefix) {
          console.log(`   API Key 前缀: ${diagnosis.environment.brevoKeyPrefix}`)
          console.log(`   API Key 格式: ${diagnosis.environment.brevoKeyFormat || 'unknown'}`)
        }
        console.log(`   发件邮箱: ${diagnosis.environment?.fromEmail || 'unknown'}\n`)
        
        if (diagnosis.testResult) {
          console.log('📧 邮件发送测试结果:')
          console.log(`   成功: ${diagnosis.testResult.success ? '✅' : '❌'}`)
          if (diagnosis.testResult.error) {
            console.log(`   错误: ${diagnosis.testResult.error}`)
          }
          if (diagnosis.testResult.messageId) {
            console.log(`   Message ID: ${diagnosis.testResult.messageId}`)
          }
          if (diagnosis.testResult.statusCode) {
            console.log(`   状态码: ${diagnosis.testResult.statusCode}`)
          }
          console.log('')
        }
        
        if (diagnosis.recommendations && diagnosis.recommendations.length > 0) {
          console.log('💡 修复建议:')
          diagnosis.recommendations.forEach((rec) => {
            console.log(`   ${rec}`)
          })
          console.log('')
        }
      } catch (error) {
        console.error('❌ 无法测试邮件发送:', error.message)
        console.log('   可能的原因: API 路由不可用或需要认证\n')
      }
    } else {
      console.log('2️⃣ 跳过邮件发送测试（未提供测试邮箱）\n')
      console.log('   使用方法: node scripts/check-production-email.js your-email@example.com\n')
    }
    
    // 3. 总结
    console.log('📋 总结:\n')
    console.log('请检查以下内容:')
    console.log('1. Vercel 环境变量中是否配置了 BREVO_API_KEY')
    console.log('2. BREVO_API_KEY 格式是否正确（应以 xkeysib- 开头）')
    console.log('3. Brevo 控制台中 API Key 是否有效')
    console.log('4. 发件邮箱是否已在 Brevo 中验证')
    console.log('5. Brevo 配额是否已用完（免费账户每日 300 封）\n')
    
    console.log('📊 查看详细日志:')
    console.log('   访问 Vercel Dashboard: https://vercel.com/dashboard')
    console.log('   选择项目 → Deployments → 最新部署 → Functions → /api/auth/signup\n')
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
    process.exit(1)
  }
}

function httpRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Citea-Email-Checker'
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
            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`))
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`))
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('请求超时'))
    })
    
    req.end()
  })
}

checkProductionEmail().catch(console.error)

