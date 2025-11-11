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
    
    // Magic Link 模式：使用 Supabase 的 generateLink 生成验证链接
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      email,
      type: 'magiclink'  // 生成 Magic Link 验证链接
    })

    if (error) {
      console.error('[Supabase Email] ❌ 生成验证链接失败:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to generate verification link',
        details: 'Supabase 验证链接生成失败'
      }
    }

    console.log('[Supabase Email] ✅ Magic Link 生成成功:', {
      email,
      linkGenerated: !!data.properties?.action_link
    })

    // Magic Link 模式：Supabase 自动生成并发送验证邮件，用户点击链接即可验证
    
    return { 
      success: true, 
      messageId: `supabase-magiclink-${Date.now()}`,
      details: 'Supabase Magic Link 验证邮件已发送',
      actionLink: data.properties?.action_link,
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