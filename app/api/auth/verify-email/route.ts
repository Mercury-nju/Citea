import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { signJwt, setAuthCookie } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const { token_hash, type } = await req.json()

        if (!token_hash || type !== 'email') {
            return NextResponse.json(
                { error: '无效的验证参数' },
                { status: 400 }
            )
        }

        console.log('[Verify Email] 开始验证邮箱')

        const supabase = createSupabaseClient()

        // 使用 token_hash 验证邮箱
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email'
        })

        if (error) {
            console.error('[Verify Email] 验证失败:', error)
            return NextResponse.json(
                { error: '验证失败，链接可能已过期' },
                { status: 400 }
            )
        }

        if (!data.user) {
            return NextResponse.json(
                { error: '验证失败，用户不存在' },
                { status: 400 }
            )
        }

        console.log('[Verify Email] ✅ 邮箱验证成功:', data.user.email)

        // 生成 JWT token 用于应用内认证
        const token = await signJwt({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email!,
            plan: data.user.user_metadata?.plan || 'free'
        })

        // 设置认证 cookie
        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            message: '邮箱验证成功！',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name,
                plan: data.user.user_metadata?.plan || 'free'
            }
        })

    } catch (error) {
        console.error('[Verify Email] 验证异常:', error)
        return NextResponse.json(
            {
                error: '验证失败',
                message: error instanceof Error ? error.message : '服务器错误'
            },
            { status: 500 }
        )
    }
}
