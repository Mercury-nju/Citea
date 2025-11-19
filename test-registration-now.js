#!/usr/bin/env node

/**
 * 测试用户注册流程
 * 验证邮件发送和验证码功能
 */

import axios from 'axios'

const DEPLOYMENT_URL = 'https://citea-9hzk2i7bh-mercury-njus-projects.vercel.app'

async function testRegistration() {
  console.log('🧪 测试用户注册流程...')
  console.log('📍 测试地址:', DEPLOYMENT_URL)
  
  try {
    // 1. 测试网站可访问性
    console.log('\n1️⃣ 测试网站可访问性...')
    const healthCheck = await axios.get(`${DEPLOYMENT_URL}/api/test-env`)
    console.log('✅ 网站可访问:', healthCheck.status)
    
    // 2. 测试邮件发送API
    console.log('\n2️⃣ 测试邮件发送API...')
    const emailTest = await axios.post(`${DEPLOYMENT_URL}/api/test-email`, {
      email: '66597405@qq.com',
      type: 'verification'
    })
    console.log('✅ 邮件API响应:', emailTest.status)
    console.log('📧 邮件发送结果:', emailTest.data)
    
    // 3. 测试用户注册API
    console.log('\n3️⃣ 测试用户注册API...')
    const signupData = {
      email: '66597405@qq.com',
      password: 'Test123456',
      name: '测试用户'
    }
    
    const signupResponse = await axios.post(`${DEPLOYMENT_URL}/api/auth/signup`, signupData)
    console.log('✅ 注册API响应:', signupResponse.status)
    console.log('📋 注册结果:', signupResponse.data)
    
    if (signupResponse.data.success) {
      console.log('\n🎉 注册流程测试成功！')
      console.log('💡 请用户66597405@qq.com:')
      console.log('- 检查邮箱收件箱')
      console.log('- 检查垃圾邮件文件夹')
      console.log('- 验证码有效期10分钟')
    } else {
      console.log('\n⚠️ 注册流程遇到问题:', signupResponse.data.message)
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
    }
  }
}

// 运行测试
testRegistration().catch(console.error)