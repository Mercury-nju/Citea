import { cookies } from 'next/headers'
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
  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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


