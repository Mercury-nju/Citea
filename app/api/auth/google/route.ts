import { NextRequest, NextResponse } from 'next/server'

// Google OAuth 初始化端点
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Client ID not configured' },
        { status: 500 }
      )
    }

    // 构建 Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.append('client_id', clientId)
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri)
    googleAuthUrl.searchParams.append('response_type', 'code')
    googleAuthUrl.searchParams.append('scope', 'openid email profile')
    googleAuthUrl.searchParams.append('access_type', 'online')
    googleAuthUrl.searchParams.append('prompt', 'select_account')

    // 重定向到 Google 登录页面
    return NextResponse.redirect(googleAuthUrl.toString())
  } catch (error) {
    console.error('Google OAuth initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize Google OAuth' },
      { status: 500 }
    )
  }
}

