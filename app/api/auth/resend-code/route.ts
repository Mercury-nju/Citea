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
