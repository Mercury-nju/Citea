import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabaseAdmin = createSupabaseAdmin()

    // 检查用户是否已存在 - 使用 listUsers 并过滤邮箱
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      // 如果用户已验证，不允许重复注册
      if (existingUser.email_confirmed_at) {
        return NextResponse.json({ 
          error: 'Email already registered',
          message: '该邮箱已注册并已验证。请直接登录。',
          verified: true
        }, { status: 409 })
      }
      
      // 如果用户未验证，删除旧用户，允许重新注册
      console.log(`[Signup] User ${email} exists but not verified. Deleting and allowing re-registration.`)
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
    }

    // 使用 Supabase Auth 注册用户
    // Supabase 会自动发送验证邮件（如果启用了 Email OTP）
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // 需要用户验证邮箱
      user_metadata: {
        name: name
      }
    })

    if (authError) {
      console.error('[Signup] Supabase Auth error:', authError)
      
      // 处理常见错误
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json({ 
          error: 'Email already registered',
          message: '该邮箱已注册。请直接登录或使用忘记密码功能。',
        }, { status: 409 })
      }
      
      return NextResponse.json({ 
        error: 'Registration failed',
        message: authError.message || '注册失败，请稍后重试。',
        details: process.env.NODE_ENV === 'development' ? authError : undefined
      }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ 
        error: 'Registration failed',
        message: '注册失败，请稍后重试。'
      }, { status: 500 })
    }

    // 发送验证邮件（Supabase 会自动发送，但我们可以手动触发）
    // 注意：如果 Supabase 配置了自动发送，这步可能不需要
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: password,
      options: {
        data: {
          name: name
        }
      }
    })

    if (emailError) {
      console.error('[Signup] Failed to send verification email:', emailError)
      // 不阻止注册，用户可以通过"重新发送验证码"功能获取
    }

    // 获取或创建 profile（触发器应该已经创建了，但确保一下）
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('[Signup] Profile error:', profileError)
    }

    // 如果 profile 不存在，手动创建（触发器可能还没执行）
    if (!profile) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase(),
          name: name,
          plan: 'free',
          credits: 3,
          credits_reset_date: tomorrow.toISOString(),
          auth_provider: 'email'
        })

      if (insertError) {
        console.error('[Signup] Failed to create profile:', insertError)
      }
    }

    console.log('[Signup] ✅ 用户注册成功!', {
      userId: authData.user.id,
      email,
      name,
      emailSent: !emailError
    })

    return NextResponse.json({ 
      user: { 
        id: authData.user.id, 
        name: name, 
        email: email, 
        plan: 'free' 
      },
      needsVerification: true,
      message: '注册成功！验证码已发送到您的邮箱，请查收并验证。'
    }, { status: 201 })
  } catch (e: any) {
    console.error('Signup error:', e)
    console.error('Error stack:', e?.stack)
    
    return NextResponse.json({ 
      error: 'Internal error', 
      message: e?.message || 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? (e?.message + '\n' + e?.stack) : undefined
    }, { status: 500 })
  }
}
