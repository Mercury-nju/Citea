import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-change-me-in-production'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

const encoder = new TextEncoder()

export interface AdminSession {
  username: string
  isAdmin: boolean
}

export async function createAdminSession(username: string): Promise<string> {
  const secret = new TextEncoder().encode(ADMIN_SECRET)
  
  const token = await new SignJWT({ username, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  return token
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get('admin_auth')
    const token = adminCookie?.value

    console.log('[Admin Auth] Getting session:', {
      hasCookie: !!adminCookie,
      hasToken: !!token,
      cookieName: adminCookie?.name,
      tokenLength: token?.length || 0
    })

    if (!token) {
      console.log('[Admin Auth] No token found in cookie')
      return null
    }

    const secret = new TextEncoder().encode(ADMIN_SECRET)
    const { payload } = await jwtVerify(token, secret)

    if (payload.isAdmin) {
      console.log('[Admin Auth] Session verified successfully:', {
        username: payload.username,
        isAdmin: payload.isAdmin
      })
      return {
        username: payload.username as string,
        isAdmin: true,
      }
    }

    console.log('[Admin Auth] Token verified but isAdmin is false')
    return null
  } catch (error) {
    console.error('[Admin Auth] Error getting session:', error)
    return null
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  // 生产环境使用 secure cookie（HTTPS 必须）
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  
  cookieStore.set('admin_auth', token, {
    httpOnly: true,
    secure: isProduction, // 生产环境启用 secure
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/', // 改为根路径，这样所有路径都可以读取（包括 /api/admin/*）
  })
  
  console.log('[Admin Auth] Cookie set:', {
    name: 'admin_auth',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
    tokenLength: token.length,
    isProduction,
    vercel: process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV
  })
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
}

