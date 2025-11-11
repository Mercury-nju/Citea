#!/usr/bin/env node

/**
 * Vercel 环境变量管理脚本
 * 用于添加 Supabase 环境变量并删除 Brevo 变量
 */

const https = require('https')

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'DOeT5aq1WudVfmaSm1SMsjas'
const VERCEL_API_URL = 'https://api.vercel.com'

// Supabase 环境变量配置
const SUPABASE_ENV_VARS = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    value: 'https://cgbjrnowqkdqhsbbbpoz.supabase.co',
    description: 'Supabase 项目 URL'
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWtkcWhzYmJicG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODI1NjcsImV4cCI6MjA3ODM1ODU2N30.U4oCBMbi6_9MKDuXWboRHlALy8PwAPOS83kJTirbspM',
    description: 'Supabase 公开 API Key'
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmpybm93cWtkcWhzYmJicG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MjU2NywiZXhwIjoyMDc4MzU4NTY3fQ.6ek3D_T4NzuCSv5SxHGjfKj-sHSj3Mgxaw_o_uOVFqE',
    description: 'Supabase 服务端 API Key（保密）'
  }
}

// 需要删除的 Brevo 环境变量
const BREVO_VARS_TO_REMOVE = [
  'BREVO_API_KEY',
  'BREVO_FROM_EMAIL'
]

// 环境类型
const ENVIRONMENTS = ['production', 'preview', 'development']

/**
 * 发送 HTTP 请求
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {}
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed })
          } else {
            reject({ status: res.statusCode, data: parsed })
          }
        } catch (e) {
          reject({ status: res.statusCode, error: e.message, body })
        }
      })
    })
    req.on('error', reject)
    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

/**
 * 获取项目列表
 */
async function getProjects() {
  console.log('📋 获取项目列表...')
  const options = {
    hostname: 'api.vercel.com',
    path: '/v9/projects',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
  
  const result = await makeRequest(options)
  return result.data.projects || []
}

/**
 * 获取项目环境变量
 */
async function getEnvVars(projectId) {
  console.log(`📋 获取项目 ${projectId} 的环境变量...`)
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/env`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
  
  const result = await makeRequest(options)
  return result.data.envs || []
}

/**
 * 创建环境变量
 */
async function createEnvVar(projectId, key, value, environments) {
  console.log(`➕ 创建环境变量: ${key}`)
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/env`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
  
  const data = {
    key,
    value,
    type: 'encrypted',
    target: environments
  }
  
  try {
    const result = await makeRequest(options, data)
    console.log(`   ✅ ${key} 创建成功`)
    return result
  } catch (error) {
    if (error.status === 409) {
      console.log(`   ⚠️  ${key} 已存在，跳过`)
      return null
    }
    console.error(`   ❌ ${key} 创建失败:`, error.data || error)
    throw error
  }
}

/**
 * 删除环境变量
 */
async function deleteEnvVar(projectId, envId) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/env/${envId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
  
  try {
    await makeRequest(options)
    return true
  } catch (error) {
    console.error(`   ❌ 删除失败:`, error.data || error)
    return false
  }
}

/**
 * 更新环境变量
 */
async function updateEnvVar(projectId, envId, value, environments) {
  console.log(`🔄 更新环境变量 ID: ${envId}`)
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/env/${envId}`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
  
  const data = {
    value,
    target: environments
  }
  
  try {
    const result = await makeRequest(options, data)
    console.log(`   ✅ 更新成功`)
    return result
  } catch (error) {
    console.error(`   ❌ 更新失败:`, error.data || error)
    throw error
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始配置 Vercel 环境变量...\n')
  
  try {
    // 1. 获取项目列表
    const projects = await getProjects()
    
    if (projects.length === 0) {
      console.error('❌ 未找到任何项目')
      process.exit(1)
    }
    
    // 查找 Citea 项目
    const citeaProject = projects.find(p => 
      p.name.toLowerCase().includes('citea') || 
      p.name.toLowerCase().includes('citea')
    ) || projects[0]
    
    console.log(`📦 找到项目: ${citeaProject.name} (${citeaProject.id})\n`)
    
    const projectId = citeaProject.id
    
    // 2. 获取现有环境变量
    const existingEnvs = await getEnvVars(projectId)
    console.log(`📋 当前有 ${existingEnvs.length} 个环境变量\n`)
    
    // 3. 添加 Supabase 环境变量
    console.log('📝 添加 Supabase 环境变量...\n')
    for (const [key, config] of Object.entries(SUPABASE_ENV_VARS)) {
      const existing = existingEnvs.find(e => e.key === key)
      
      if (existing) {
        // 如果已存在，更新它
        console.log(`🔄 更新环境变量: ${key}`)
        await updateEnvVar(projectId, existing.id, config.value, ENVIRONMENTS)
        console.log(`   ✅ ${key} 更新成功\n`)
      } else {
        // 如果不存在，创建它
        await createEnvVar(projectId, key, config.value, ENVIRONMENTS)
        console.log(`   📝 ${config.description}\n`)
      }
    }
    
    // 4. 删除 Brevo 环境变量
    console.log('🗑️  删除 Brevo 环境变量...\n')
    for (const key of BREVO_VARS_TO_REMOVE) {
      const existing = existingEnvs.find(e => e.key === key)
      if (existing) {
        console.log(`🗑️  删除: ${key}`)
        const deleted = await deleteEnvVar(projectId, existing.id)
        if (deleted) {
          console.log(`   ✅ ${key} 删除成功\n`)
        } else {
          console.log(`   ⚠️  ${key} 删除失败\n`)
        }
      } else {
        console.log(`   ℹ️  ${key} 不存在，跳过\n`)
      }
    }
    
    // 5. 显示最终状态
    console.log('📊 最终环境变量列表:\n')
    const finalEnvs = await getEnvVars(projectId)
    const supabaseVars = finalEnvs.filter(e => e.key.startsWith('SUPABASE') || e.key.startsWith('NEXT_PUBLIC_SUPABASE'))
    const brevoVars = finalEnvs.filter(e => e.key.startsWith('BREVO'))
    
    console.log('✅ Supabase 变量:')
    supabaseVars.forEach(env => {
      console.log(`   - ${env.key} (${env.target.join(', ')})`)
    })
    
    if (brevoVars.length > 0) {
      console.log('\n⚠️  剩余的 Brevo 变量:')
      brevoVars.forEach(env => {
        console.log(`   - ${env.key} (${env.target.join(', ')})`)
      })
    } else {
      console.log('\n✅ 所有 Brevo 变量已删除')
    }
    
    console.log('\n✨ 环境变量配置完成！')
    console.log('\n📝 下一步:')
    console.log('   1. 在 Supabase Dashboard 运行 SQL 脚本')
    console.log('   2. 重新部署 Vercel 项目')
    console.log('   3. 测试注册功能')
    
  } catch (error) {
    console.error('\n❌ 错误:', error)
    process.exit(1)
  }
}

// 运行主函数
main().catch(console.error)






