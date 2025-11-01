import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const encoder = new TextEncoder()

export type AuthUser = {
  id: string
  email: string
  name: string
  plan?: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const JWT_EXPIRES_SECONDS = 60 * 60 * 24 * 7 // 7 days
const AUTH_COOKIE = 'citea_auth'

export async function signJwt(user: AuthUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_SECONDS)
    .sign(encoder.encode(JWT_SECRET))
  return token
}

export async function verifyJwt(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET))
    return (payload as any).user as AuthUser
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: JWT_EXPIRES_SECONDS,
  })
}

export function setAuthCookieInResponse(response: NextResponse, token: string) {
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production'
  
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProduction, // 在生产环境使用 secure（需要 HTTPS）
    sameSite: 'lax',
    path: '/',
    maxAge: JWT_EXPIRES_SECONDS,
    // 明确设置 domain（在生产环境可能不需要，但明确设置有助于调试）
    // domain: isProduction ? undefined : 'localhost',
  })
  
  console.log('[Auth] Cookie 设置:', {
    name: AUTH_COOKIE,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: JWT_EXPIRES_SECONDS,
  })
}

export async function clearAuthCookie() {
  cookies().set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function getAuthTokenFromCookies(): string | null {
  const c = cookies().get(AUTH_COOKIE)
  return c?.value || null
}


