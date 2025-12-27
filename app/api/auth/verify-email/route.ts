import { NextResponse } from 'next/server'
import { createSupabaseAdmin, createSupabaseClient } from '@/lib/supabase'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { getUserByEmail, updateUserVerification, verifyUserEmail } from '@/lib/userStore'

export async function POST(req: Request) {
  try {
    const { email, code, sessionToken } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: '缺少邮箱' }, { status: 400 })
    }

    // Magic Link 模式：如果提供了 sessionToken，说明用户已通过点击 Magic Link 完成验证
    if (sessionToken) {
      console.log('[Verify] Magic Link 验证模式 - 使用 sessionToken 验证')
      const supabaseClient = createSupabaseClient()
      const { data: { user }, error: sessionError } = await supabaseClient.auth.getUser(sessionToken)

      if (sessionError || !user) {
        return NextResponse.json({ 
          error: '验证失败',
          message: 'Magic Link 无效或已过期。'
        }, { status: 400 })
      }

      if (user.email !== email.toLowerCase()) {
        return NextResponse.json({ 
          error: '验证失败',
          message: '邮箱不匹配。'
        }, { status: 400 })
      }

      // 验证成功，获取 profile
      const supabaseAdmin = createSupabaseAdmin()
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // 更新 profile 的 last_login_at
      if (profile) {
        await supabaseAdmin
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      // 更新本地存储用户的 emailVerified 状态（如果存在）
      const localUser = await getUserByEmail(email.toLowerCase())
      if (localUser && !localUser.emailVerified) {
        const { updateUser } = await import('@/lib/userStore')
        await updateUser(email.toLowerCase(), { emailVerified: true })
        console.log('[Verify] ✅ 已更新本地用户的邮箱验证状态')
      }

      // 发送欢迎邮件
      try {
        await sendWelcomeEmail(email, profile?.name || user.user_metadata?.name || email)
      } catch (emailError) {
        console.error('[Verify] Welcome email failed:', emailError)
      }

      // 生成 JWT token
      const token = await signJwt({ 
        id: user.id, 
        name: profile?.name || user.user_metadata?.name || email, 
        email: user.email!, 
        plan: (profile?.plan as any) || 'free' 
      })
      await setAuthCookie(token)

      return NextResponse.json({ 
        success: true,
        user: { 
          id: user.id, 
          name: profile?.name || user.user_metadata?.name || email, 
          email: user.email!, 
          plan: (profile?.plan as any) || 'free' 
        },
        message: '邮箱验证成功！'
      })
    }

    // Magic Link 模式：不再支持本地存储用户的 code 验证
    // 所有验证都通过 Supabase Magic Link 完成

    // Magic Link 模式：如果用户点击了 Magic Link，会携带 sessionToken
    // 这个逻辑已经移到前面处理，这里不再需要重复处理

    // Magic Link 模式：如果没有 sessionToken，返回错误信息
    if (!sessionToken) {
      return NextResponse.json({ 
        error: 'Magic Link 验证失败',
        message: '请通过邮箱中的验证链接进行验证，或重新注册。'
      }, { status: 400 })
    }

    // 如果是本地存储用户且已验证，直接返回成功
    const localUser = await getUserByEmail(email.toLowerCase())
    if (localUser && localUser.emailVerified) {
      return NextResponse.json({ 
        success: true,
        user: { 
          id: localUser.id, 
          name: localUser.name || email, 
          email: localUser.email, 
          plan: localUser.plan || 'free' 
        },
        message: '邮箱已经验证成功！'
      })
    }

    // Magic Link 模式：不再支持 code 验证，只支持 sessionToken
    // 如果到达这里，说明没有有效的 sessionToken
    return NextResponse.json({ 
      error: 'Magic Link 验证失败',
      message: '验证链接无效或已过期，请重新注册获取新的验证链接。'
    }, { status: 400 })
    // Magic Link 模式：本地存储用户也不再使用 code 验证
    return NextResponse.json({ 
      error: 'Magic Link 验证失败',
      message: '本地用户验证功能已更新为 Magic Link 模式，请重新注册。'
    }, { status: 400 })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ 
      error: '验证失败',
      message: error instanceof Error ? error.message : '验证过程中发生错误，请稍后重试。'
    }, { status: 500 })
  }
}
