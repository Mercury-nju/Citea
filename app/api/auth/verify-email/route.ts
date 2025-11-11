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

    // 首先检查是否是本地存储用户
    const localUser = await getUserByEmail(email.toLowerCase())
    
    if (localUser && !localUser.emailVerified) {
      // 本地存储用户验证逻辑
      if (!code) {
        return NextResponse.json({ error: '缺少验证码' }, { status: 400 })
      }

      // 验证验证码
      if (localUser.verificationCode !== code) {
        return NextResponse.json({ 
          error: '验证码无效',
          message: '验证码不正确，请检查后重新输入。'
        }, { status: 400 })
      }

      // 检查验证码是否过期
      const now = new Date()
      if (!localUser.verificationExpiry) {
        return NextResponse.json({ 
          error: '验证码已过期',
          message: '验证码已过期，请重新获取验证码。'
        }, { status: 400 })
      }
      const expiry = new Date(localUser.verificationExpiry)
      if (now > expiry) {
        return NextResponse.json({ 
          error: '验证码已过期',
          message: '验证码已过期，请重新获取验证码。'
        }, { status: 400 })
      }

      // 验证成功，标记邮箱为已验证
      await verifyUserEmail(email.toLowerCase(), code)

      // 发送欢迎邮件
      try {
        await sendWelcomeEmail(email, localUser.name || email)
      } catch (emailError) {
        console.error('[Verify] Welcome email failed:', emailError)
      }

      // 生成 JWT token
      const token = await signJwt({ 
        id: localUser.id, 
        name: localUser.name || email, 
        email: localUser.email, 
        plan: localUser.plan || 'free' 
      })
      await setAuthCookie(token)

      return NextResponse.json({ 
        success: true,
        user: { 
          id: localUser.id, 
          name: localUser.name || email, 
          email: localUser.email, 
          plan: localUser.plan || 'free' 
        },
        message: '邮箱验证成功！'
      })
    }

    // 如果提供了 sessionToken，说明客户端已经通过 Supabase 验证了 OTP
    // 我们只需要验证 session 并生成 JWT
    if (sessionToken) {
      const supabaseClient = createSupabaseClient()
      const { data: { user }, error: sessionError } = await supabaseClient.auth.getUser(sessionToken)

      if (sessionError || !user) {
        return NextResponse.json({ 
          error: '验证失败',
          message: 'Session 无效或已过期。'
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

      // 发送欢迎邮件（可选）
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

    // 如果没有 sessionToken，尝试使用 code 验证（向后兼容）
    if (!code) {
      return NextResponse.json({ error: '缺少验证码或 session token' }, { status: 400 })
    }

    // 如果是本地存储用户且已验证，直接返回成功
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

    const supabaseAdmin = createSupabaseAdmin()

    // 尝试使用客户端实例验证 OTP（Supabase 的 verifyOtp 主要在客户端使用）
    // 服务端验证需要创建临时客户端实例
    try {
      const supabaseClient = createSupabaseClient()
      const { data: verifyData, error: verifyError } = await supabaseClient.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      })

      if (verifyError || !verifyData.user) {
        console.error('[Verify] OTP verification error:', verifyError)
        return NextResponse.json({ 
          error: '验证码无效或已过期',
          message: verifyError?.message || '验证码无效或已过期，请重新获取。'
        }, { status: 400 })
      }

      // 验证成功，更新用户邮箱确认状态
      await supabaseAdmin.auth.admin.updateUserById(
        verifyData.user.id,
        { email_confirm: true }
      )

      // 获取 profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', verifyData.user.id)
        .single()

      // 更新 profile
      if (profile) {
        await supabaseAdmin
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', verifyData.user.id)
      }

      // 发送欢迎邮件
      try {
        await sendWelcomeEmail(email, profile?.name || verifyData.user.user_metadata?.name || email)
      } catch (emailError) {
        console.error('[Verify] Welcome email failed:', emailError)
      }

      // 生成 JWT token
      const token = await signJwt({ 
        id: verifyData.user.id, 
        name: profile?.name || verifyData.user.user_metadata?.name || email, 
        email: verifyData.user.email!, 
        plan: (profile?.plan as any) || 'free' 
      })
      await setAuthCookie(token)

      return NextResponse.json({ 
        success: true,
        user: { 
          id: verifyData.user.id, 
          name: profile?.name || verifyData.user.user_metadata?.name || email, 
          email: verifyData.user.email!, 
          plan: (profile?.plan as any) || 'free' 
        },
        message: '邮箱验证成功！'
      })
    } catch (error) {
      console.error('[Verify] Verification error:', error)
      return NextResponse.json({ 
        error: '验证失败',
        message: '验证过程中发生错误，请稍后重试。'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ 
      error: '验证失败',
      message: error instanceof Error ? error.message : '验证过程中发生错误，请稍后重试。'
    }, { status: 500 })
  }
}
