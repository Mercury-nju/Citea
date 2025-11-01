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
    const token = cookieStore.get('admin_auth')?.value

    if (!token) {
      return null
    }

    const secret = new TextEncoder().encode(ADMIN_SECRET)
    const { payload } = await jwtVerify(token, secret)

    if (payload.isAdmin) {
      return {
        username: payload.username as string,
        isAdmin: true,
      }
    }

    return null
  } catch {
    return null
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('admin_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/admin',
  })
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
}

