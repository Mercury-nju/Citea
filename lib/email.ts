import { createSupabaseAdmin } from './supabase'

// 注意：已经完全迁移到 Supabase 邮件服务
// Brevo 依赖已移除

// 使用 Supabase 发送验证邮件 - Magic Link 模式
async function sendVerificationEmailViaSupabase(
  email: string,
  code: string, // 此参数在 Magic Link 模式下不再使用
  name: string
) {
  try {
    console.log('[Supabase Email] 📧 开始发送 Magic Link 验证邮件:', {
      to: email,
      name,
      timestamp: new Date().toISOString()
    })

    const supabaseAdmin = createSupabaseAdmin()
    
    // 使用 signInWithOtp 发送 Magic Link 邮件
    // 这会自动发送邮件给用户
    const { data, error } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // 如果用户不存在则创建
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://citea.app'}/auth/verify-email?verified=true`
      }
    })

    if (error) {
      console.error('[Supabase Email] ❌ 发送 Magic Link 失败:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to send magic link',
        details: 'Supabase Magic Link 发送失败'
      }
    }

    console.log('[Supabase Email] ✅ Magic Link 邮件发送成功:', {
      email,
      timestamp: new Date().toISOString()
    })

    return { 
      success: true, 
      messageId: `supabase-magiclink-${Date.now()}`,
      details: 'Supabase Magic Link 验证邮件已发送',
      note: '用户点击邮件中的 Magic Link 链接即可完成验证，无需输入验证码'
    }
  } catch (error) {
    console.error('[Supabase Email] ❌ Supabase 邮件发送失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Supabase 邮件服务异常'
    }
  }
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  name: string,
  retryCount: number = 3
) {
  // 只使用 Supabase 邮件服务 - Magic Link 模式
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[Email] 使用 Supabase 邮件服务发送 Magic Link 验证邮件')
    return await sendVerificationEmailViaSupabase(email, code, name)
  }
  
  // 如果 Supabase 未配置
  console.error('[Email] ❌ Supabase 邮件服务未配置')
  console.error('[Email] 请在环境变量中配置 SUPABASE_SERVICE_ROLE_KEY')
  return { 
    success: false, 
    error: 'Email service not configured', 
    details: 'Supabase 邮件服务未配置，请检查 SUPABASE_SERVICE_ROLE_KEY' 
  }
}

// Brevo 邮件服务已完全移除
// 现在只使用 Supabase 邮件服务

export async function sendWelcomeEmail(email: string, name: string) {
  // 欢迎邮件功能暂时禁用，因为 Supabase Magic Link 模式不需要单独的欢迎邮件
  // 用户通过 Magic Link 验证后可以直接登录
  console.log('[Email] 欢迎邮件功能已禁用（Supabase Magic Link 模式）')
  return { 
    success: true, 
    messageId: `welcome-disabled-${Date.now()}`,
    details: 'Supabase Magic Link 模式不需要单独的欢迎邮件'
  }
}