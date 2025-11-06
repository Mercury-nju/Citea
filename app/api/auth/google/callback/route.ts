import { NextRequest, NextResponse } from 'next/server'
import { signJwt } from '@/lib/auth'
import { getUserByEmail, createUser } from '@/lib/userStore'

interface GoogleTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  id_token: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}

// Google OAuth 回调端点
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // 检查是否有错误
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=google_auth_failed`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=no_code`
      )
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      console.error('Missing Google OAuth credentials')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=config_error`
      )
    }

    // 1. 用授权码换取访问令牌
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Google token exchange failed:', errorData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=token_exchange_failed`
      )
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // 2. 使用访问令牌获取用户信息
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch Google user info')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=user_info_failed`
      )
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    // 3. 检查用户是否已存在
    let user = await getUserByEmail(googleUser.email)

    if (!user) {
      // 4. 如果用户不存在，创建新用户
      const { getPlanLimits } = await import('@/lib/credits')
      const defaultCredits = getPlanLimits('free').maxCredits
      
      const newUser: any = {
        id: crypto.randomUUID(),
        name: googleUser.name,
        email: googleUser.email,
        plan: 'free' as const,
        passwordHash: '', // Google 登录不需要密码
        emailVerified: googleUser.verified_email,
        authProvider: 'google' as const,
        googleId: googleUser.id,
        avatar: googleUser.picture,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        credits: defaultCredits,
      }
      
      await createUser(newUser)
      user = newUser
    } else {
      // 5. 如果用户已存在，更新 Google 相关信息（如果之前是邮箱注册的）
      if (!user.googleId) {
        const { updateUser } = await import('@/lib/userStore')
        await updateUser(user.email, {
          googleId: googleUser.id,
          avatar: googleUser.picture,
          emailVerified: true,
          authProvider: 'google',
        })
        user.googleId = googleUser.id
        user.avatar = googleUser.picture
        user.emailVerified = true
      }
    }

    // 6. 生成 JWT token
    const token = await signJwt({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    })

    // 7. 重定向到 dashboard，并在 URL 中携带 token
    const dashboardUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL)
    dashboardUrl.searchParams.append('token', token)
    dashboardUrl.searchParams.append('user', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      avatar: user.avatar,
    }))

    return NextResponse.redirect(dashboardUrl.toString())
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=unexpected_error`
    )
  }
}

