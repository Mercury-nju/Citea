import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { getUserByEmail, updateUserVerification } from '@/lib/userStore'
import { sendVerificationEmail } from '@/lib/email'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: '缺少邮箱' }, { status: 400 })
    }

    // 首先检查本地存储用户
    const localUser = await getUserByEmail(email.toLowerCase())
    
    if (localUser) {
      // 本地存储用户重发验证码逻辑
      
      // 如果已验证，不需要重新发送
      if (localUser.emailVerified) {
        return NextResponse.json({ error: '邮箱已验证' }, { status: 400 })
      }

      // 生成新的验证码
      const newVerificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const newVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      // 更新用户的验证码和过期时间
      await updateUserVerification(email.toLowerCase(), newVerificationCode, newVerificationExpiry)

      // 发送验证邮件
      let emailSent = false
      let emailError = null
      let message = ''

      try {
        // 检查是否有邮件服务配置（优先检查 Supabase）
        const hasSupabaseService = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
        const hasBrevoService = !!process.env.BREVO_API_KEY
        const hasResendService = !!process.env.RESEND_API_KEY
        const hasEmailService = hasSupabaseService || hasBrevoService || hasResendService
        
        if (hasEmailService) {
          const serviceName = hasSupabaseService ? 'Supabase' : (hasBrevoService ? 'Brevo' : 'Resend')
          console.log(`[Resend] ${serviceName} 邮件服务可用，正在发送验证码邮件...`)
          
          const emailResult = await sendVerificationEmail(email, newVerificationCode, localUser.name || email)
          
          if (emailResult.success) {
            console.log(`[Resend] ✅ 本地用户验证码邮件发送成功! MessageId: ${emailResult.messageId}`)
            emailSent = true
            message = '验证码已重新发送！请检查您的邮箱。'
          } else {
            console.error('[Resend] ❌ 本地用户验证码邮件发送失败:', emailResult.error)
            emailError = emailResult.error || '邮件发送失败'
            message = '邮件发送失败，请稍后重试。'
          }
        } else {
          console.log('[Resend] ⚠️ 未配置邮件服务，无法发送验证码')
          emailError = '邮件服务未配置'
          message = '邮件服务未配置，请联系管理员。'
        }
      } catch (error) {
        console.error('[Resend] 邮件发送失败:', error)
        emailError = '验证码发送失败'
        message = '邮件发送失败，请稍后重试。'
      }

      return NextResponse.json({ 
        success: true,
        message,
        code: process.env.NODE_ENV === 'development' ? newVerificationCode : undefined, // 开发环境返回验证码用于测试
        emailSent,
        emailError
      })
    }

    // Supabase用户重发验证码逻辑
    const supabaseAdmin = createSupabaseAdmin()

    // 检查用户是否存在 - 使用 listUsers 并过滤邮箱
    const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      return NextResponse.json({ error: '查询用户失败' }, { status: 500 })
    }

    // 查找匹配邮箱的用户
    const user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 如果已验证，不需要重新发送
    if (user.email_confirmed_at) {
      return NextResponse.json({ error: '邮箱已验证' }, { status: 400 })
    }

    // 使用 Supabase Admin API 重新发送验证邮件
    // 注意：Supabase 的 resend 功能需要通过客户端 SDK 调用
    // 服务端方案：删除并重新创建用户（会触发验证邮件）
    const userMetadata = user.user_metadata || {}
    
    // 删除未验证用户
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error('[Resend] Failed to delete user:', deleteError)
      return NextResponse.json({ 
        error: '邮件发送失败',
        message: '无法重新发送验证邮件，请稍后重试。'
      }, { status: 500 })
    }
    
    // 重新创建用户（会触发验证邮件）
    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // 随机密码，用户需要重置
      email_confirm: false,
      user_metadata: userMetadata
    })

    if (createError || !newUserData.user) {
      console.error('[Resend] Failed to recreate user:', createError)
      return NextResponse.json({ 
        error: '邮件发送失败',
        message: '无法重新发送验证邮件，请稍后重试。'
      }, { status: 500 })
    }

    // 重新创建用户会触发验证邮件
    return NextResponse.json({ 
      success: true,
      message: '验证码已重新发送！请检查您的邮箱。'
    })
  } catch (error) {
    console.error('Resend code error:', error)
    return NextResponse.json({ 
      error: '重新发送失败',
      message: error instanceof Error ? error.message : '重新发送验证码时发生错误，请稍后重试。'
    }, { status: 500 })
  }
}
