#!/usr/bin/env node

/**
 * 邮件验证问题诊断脚本
 * 
 * 用途：检查邮件服务配置，帮助诊断用户无法收到验证邮件的问题
 */

require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(60));
console.log('📧 邮件验证问题诊断工具');
console.log('='.repeat(60));
console.log();

// 1. 检查环境变量
console.log('1️⃣  检查环境变量配置');
console.log('-'.repeat(60));

const envChecks = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'BREVO_API_KEY': process.env.BREVO_API_KEY,
  'RESEND_API_KEY': process.env.RESEND_API_KEY,
  'JWT_SECRET': process.env.JWT_SECRET,
};

let hasSupabase = false;
let hasBrevo = false;
let hasResend = false;

for (const [key, value] of Object.entries(envChecks)) {
  const status = value ? '✅' : '❌';
  const displayValue = value 
    ? (key.includes('KEY') || key.includes('SECRET') 
        ? `${value.substring(0, 20)}...` 
        : value)
    : '未配置';
  
  console.log(`${status} ${key}: ${displayValue}`);
  
  if (key === 'SUPABASE_SERVICE_ROLE_KEY' && value) hasSupabase = true;
  if (key === 'BREVO_API_KEY' && value) hasBrevo = true;
  if (key === 'RESEND_API_KEY' && value) hasResend = true;
}

console.log();

// 2. 判断邮件服务状态
console.log('2️⃣  邮件服务状态');
console.log('-'.repeat(60));

if (hasSupabase) {
  console.log('✅ Supabase 邮件服务已配置（推荐）');
} else {
  console.log('❌ Supabase 邮件服务未配置');
}

if (hasBrevo) {
  console.log('✅ Brevo 备用邮件服务已配置');
} else {
  console.log('⚠️  Brevo 备用邮件服务未配置');
}

if (hasResend) {
  console.log('✅ Resend 备用邮件服务已配置');
} else {
  console.log('⚠️  Resend 备用邮件服务未配置');
}

console.log();

// 3. 测试 Supabase 连接（如果配置了）
if (hasSupabase) {
  console.log('3️⃣  测试 Supabase 连接');
  console.log('-'.repeat(60));
  
  (async () => {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      // 测试连接
      const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      
      if (error) {
        console.log('❌ Supabase 连接失败:', error.message);
      } else {
        console.log('✅ Supabase 连接成功');
        console.log(`   项目 URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
      }
    } catch (err) {
      console.log('❌ Supabase 测试失败:', err.message);
    }
    
    console.log();
    printRecommendations();
  })();
} else {
  console.log('3️⃣  跳过 Supabase 连接测试（未配置）');
  console.log();
  printRecommendations();
}

function printRecommendations() {
  console.log('4️⃣  诊断结果与建议');
  console.log('='.repeat(60));
  
  if (!hasSupabase && !hasBrevo && !hasResend) {
    console.log('🚨 严重问题：没有配置任何邮件服务！');
    console.log();
    console.log('📋 修复步骤：');
    console.log('1. 创建或获取 Supabase 项目');
    console.log('   访问: https://app.supabase.com');
    console.log();
    console.log('2. 在 Vercel 中配置以下环境变量：');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.log();
    console.log('3. 在 Supabase Dashboard 启用邮件服务：');
    console.log('   Authentication → Providers → Email → 启用');
    console.log();
    console.log('4. 重新部署应用');
  } else if (hasSupabase) {
    console.log('✅ Supabase 邮件服务已配置');
    console.log();
    console.log('📋 如果用户仍然收不到邮件，请检查：');
    console.log();
    console.log('1. Vercel 生产环境变量：');
    console.log('   - 确认环境变量已应用到 Production 环境');
    console.log('   - 确认没有多余的空格或换行符');
    console.log();
    console.log('2. Supabase Dashboard 配置：');
    console.log('   - Authentication → Providers → Email 已启用');
    console.log('   - Authentication → URL Configuration → Site URL 正确');
    console.log('   - 检查邮件发送配额是否用完');
    console.log();
    console.log('3. 查看 Vercel 函数日志：');
    console.log('   - 访问 Vercel Dashboard → Deployments → Functions');
    console.log('   - 查看 /api/auth/signup 的 POST 请求日志');
    console.log('   - 查找 [Email] 或 [Supabase Email] 相关日志');
    console.log();
    console.log('4. 用户检查：');
    console.log('   - 垃圾邮件文件夹');
    console.log('   - 邮箱过滤规则');
    console.log('   - 邮箱是否有效');
  } else {
    console.log('⚠️  仅配置了备用邮件服务（Brevo/Resend）');
    console.log();
    console.log('📋 建议：');
    console.log('配置 Supabase 邮件服务以获得更好的集成体验');
  }
  
  console.log();
  console.log('='.repeat(60));
  console.log('📞 需要更多帮助？');
  console.log('   查看文档: CREATE_NEW_SUPABASE_PROJECT.md');
  console.log('   查看文档: SUPABASE_EMAIL_SETUP.md');
  console.log('='.repeat(60));
}
