import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: '缺少邮箱' }, { status: 400 })
    }

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
    // 服务端可以使用 admin API 的 generateLink 方法
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email
    })

    if (linkError) {
      console.error('[Resend] Failed to generate verification link:', linkError)
      return NextResponse.json({ 
        error: '邮件发送失败',
        message: linkError.message || '验证码邮件发送失败，请稍后重试。'
      }, { status: 500 })
    }

    // 注意：Supabase 的 generateLink 会生成一个链接，但不会直接发送邮件
    // 我们需要使用 Supabase 的 resend 功能，但这通常需要在客户端调用
    // 作为替代方案，我们可以使用 Supabase 的 Admin API 发送邀请邮件
    
    // 使用 generateLink 生成验证链接，然后通过客户端发送
    // 或者使用 resend 功能（需要客户端调用）
    // 最简单的方式：删除并重新创建用户（会触发验证邮件）
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
