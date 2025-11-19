import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json()

        // 验证输入
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: '缺少必填字段' },
                { status: 400 }
            )
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: '邮箱格式不正确' },
                { status: 400 }
            )
        }

        // 验证密码长度
        if (password.length < 6) {
            return NextResponse.json(
                { error: '密码至少需要 6 个字符' },
                { status: 400 }
            )
        }

        console.log('[Signup] 开始注册用户:', email)

        // 使用 Supabase Admin 创建用户
        const supabase = createSupabaseAdmin()

        const { data, error } = await supabase.auth.admin.createUser({
            email: email.toLowerCase(),
            password,
            email_confirm: false, // 需要邮件验证
            user_metadata: {
                name,
                plan: 'free',
                credits: 3
            }
        })

        if (error) {
            console.error('[Signup] Supabase 创建用户失败:', error)

            // 处理常见错误
            if (error.message.includes('already registered')) {
                return NextResponse.json(
                    { error: '该邮箱已被注册' },
                    { status: 409 }
                )
            }

            return NextResponse.json(
                { error: error.message || '注册失败' },
                { status: 400 }
            )
        }

        console.log('[Signup] ✅ 用户创建成功:', data.user?.id)

        // Supabase 会自动发送验证邮件
        return NextResponse.json({
            success: true,
            message: '注册成功！我们已向您的邮箱发送了验证链接，请查收邮件完成验证。',
            user: {
                id: data.user?.id,
                email: data.user?.email,
                name
            }
        }, { status: 201 })

    } catch (error) {
        console.error('[Signup] 注册异常:', error)
        return NextResponse.json(
            {
                error: '注册失败',
                message: error instanceof Error ? error.message : '服务器错误，请稍后重试'
            },
            { status: 500 }
        )
    }
}
