#!/usr/bin/env node

/**
 * 检查 Vercel 邮件发送问题
 * 使用 Vercel API 检查环境变量和日志
 */

const https = require('https')

// 从环境变量获取 Vercel Token（如果已设置）
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.argv[2]
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'mercury-njus-projects'
const PROJECT_NAME = 'citea'

if (!VERCEL_TOKEN) {
  console.error('❌ 请提供 Vercel Token')
  console.log('使用方法:')
  console.log('  1. 设置环境变量: export VERCEL_TOKEN=your-token')
  console.log('  2. 或作为参数: node scripts/check-vercel-email-issue.js <VERCEL_TOKEN>')
  console.log('\n获取 Token:')
  console.log('  1. 访问 https://vercel.com/account/tokens')
  console.log('  2. 创建新的 Token')
  console.log('  3. 复制 Token 并使用\n')
  process.exit(1)
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
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(JSON.parse(data))
          } else {
            reject(new Error(`API 错误: ${res.statusCode} - ${data}`))
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}

async function checkEmailIssue() {
  try {
    console.log('🔍 检查邮件发送问题...\n')
    console.log('=' .repeat(60))
    
    // 1. 获取项目信息
    console.log('\n1️⃣ 检查项目信息...')
    let project
    try {
      project = await vercelApiRequest(`/v9/projects/${PROJECT_NAME}?teamId=${VERCEL_TEAM_ID}`)
      console.log(`   ✅ 项目: ${project.name}`)
      console.log(`   📦 项目 ID: ${project.id}`)
    } catch (error) {
      console.error(`   ❌ 获取项目失败: ${error.message}`)
      return
    }
    
    // 2. 检查环境变量
    console.log('\n2️⃣ 检查环境变量...')
    let envVars
    try {
      envVars = await vercelApiRequest(`/v9/projects/${PROJECT_NAME}/env?teamId=${VERCEL_TEAM_ID}`)
      
      const brevoKey = envVars.find((v) => v.key === 'BREVO_API_KEY')
      const brevoEmail = envVars.find((v) => v.key === 'BREVO_FROM_EMAIL')
      
      if (brevoKey) {
        console.log('   ✅ BREVO_API_KEY: 已配置')
        console.log(`   📝 值: ${brevoKey.value.substring(0, 20)}...`)
        console.log(`   🔍 格式: ${brevoKey.value.startsWith('xkeysib-') ? '✅ 正确' : '❌ 可能不正确（应该以 xkeysib- 开头）'}`)
        console.log(`   🌍 环境: ${brevoKey.target.join(', ')}`)
        
        // 检查是否包含生产环境
        if (!brevoKey.target.includes('production')) {
          console.log('   ⚠️  警告: BREVO_API_KEY 未应用到生产环境！')
          console.log('   💡 请在 Vercel 项目设置中将环境变量应用到 Production')
        }
      } else {
        console.log('   ❌ BREVO_API_KEY: 未配置')
        console.log('   💡 这就是问题所在！')
        console.log('   解决方案:')
        console.log('   1. 访问 https://app.brevo.com/settings/keys/api')
        console.log('   2. 生成新的 API Key')
        console.log('   3. 在 Vercel 项目设置中添加环境变量 BREVO_API_KEY')
        console.log('   4. 确保应用到 Production 环境')
        console.log('   5. 重新部署应用')
        return
      }
      
      if (brevoEmail) {
        console.log('   ✅ BREVO_FROM_EMAIL: 已配置')
        console.log(`   📝 值: ${brevoEmail.value}`)
        console.log(`   🌍 环境: ${brevoEmail.target.join(', ')}`)
      } else {
        console.log('   ⚠️  BREVO_FROM_EMAIL: 未配置（将使用默认值）')
      }
    } catch (error) {
      console.error(`   ❌ 获取环境变量失败: ${error.message}`)
    }
    
    // 3. 获取最新部署
    console.log('\n3️⃣ 检查最新部署...')
    try {
      const deployments = await vercelApiRequest(`/v6/deployments?projectId=${project.id}&teamId=${VERCEL_TEAM_ID}&limit=1`)
      
      if (!deployments.deployments || deployments.deployments.length === 0) {
        console.log('   ❌ 没有找到部署')
        return
      }
      
      const deployment = deployments.deployments[0]
      console.log(`   ✅ 最新部署: ${deployment.uid}`)
      console.log(`   🌐 URL: https://${deployment.url}`)
      console.log(`   📊 状态: ${deployment.readyState}`)
      console.log(`   🕐 创建时间: ${new Date(deployment.createdAt).toLocaleString()}`)
      console.log(`   🎯 环境: ${deployment.target || 'production'}`)
      
      // 4. 提供日志查看链接
      console.log('\n4️⃣ 查看运行时日志...')
      console.log('   💡 Vercel API 无法直接获取 Functions 运行时日志')
      console.log('   请访问 Vercel Dashboard 查看详细日志：')
      console.log(`   📋 https://vercel.com/${VERCEL_TEAM_ID}/${PROJECT_NAME}/deployments/${deployment.uid}`)
      console.log('   ')
      console.log('   查看邮件发送日志步骤:')
      console.log('   1. 点击部署 → "Functions" 标签')
      console.log('   2. 找到 "/api/auth/signup" 函数')
      console.log('   3. 查看日志，查找以下关键词:')
      console.log('      - [Email] - 邮件发送相关')
      console.log('      - [Signup] - 注册相关')
      console.log('      - BREVO_API_KEY - API Key 配置')
      console.log('      - 邮件发送失败 - 错误信息')
      
      // 5. 测试诊断 API
      console.log('\n5️⃣ 测试邮件发送诊断 API...')
      console.log(`   🔗 https://${deployment.url}/api/test/email-diagnosis?email=test@example.com`)
      console.log('   💡 访问此 URL 可以测试邮件发送功能')
      
    } catch (error) {
      console.error(`   ❌ 获取部署信息失败: ${error.message}`)
    }
    
    // 6. 总结和建议
    console.log('\n' + '='.repeat(60))
    console.log('\n📋 诊断总结:')
    console.log('\n✅ 已检查:')
    console.log('   - 项目信息')
    console.log('   - 环境变量配置')
    console.log('   - 最新部署状态')
    console.log('\n💡 下一步:')
    console.log('   1. 检查 Vercel Dashboard 中的 Functions 日志')
    console.log('   2. 尝试注册新用户，观察日志')
    console.log('   3. 查看邮件发送相关的错误信息')
    console.log('   4. 检查 Brevo 控制台的发送日志')
    console.log('\n🔧 常见问题修复:')
    console.log('   1. BREVO_API_KEY 未配置 → 添加环境变量')
    console.log('   2. API Key 无效 → 生成新的 API Key')
    console.log('   3. 配额已用完 → 等待重置或升级')
    console.log('   4. 发件邮箱未验证 → 在 Brevo 中验证邮箱')
    console.log('\n')
    
  } catch (error) {
    console.error('\n❌ 检查失败:', error.message)
    if (error.stack) {
      console.error('\n错误堆栈:')
      console.error(error.stack)
    }
  }
}

checkEmailIssue()

