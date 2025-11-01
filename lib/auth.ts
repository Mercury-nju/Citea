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

// 确保 JWT_SECRET 存在，如果未设置，使用一个固定的默认值
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// 在模块加载时输出 JWT_SECRET 状态（用于调试）
if (typeof process !== 'undefined' && process.env) {
  console.log('[Auth] JWT_SECRET status:', {
    hasEnvVar: !!process.env.JWT_SECRET,
    length: process.env.JWT_SECRET?.length || 0,
    usingDefault: !process.env.JWT_SECRET,
    preview: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'N/A'
  })
}
const JWT_EXPIRES_SECONDS = 60 * 60 * 24 * 7 // 7 days
const AUTH_COOKIE = 'citea_auth'

export async function signJwt(user: AuthUser): Promise<string> {
  console.log('[signJwt] 生成 token for user:', user.email)
  console.log('[signJwt] JWT_SECRET from env:', process.env.JWT_SECRET ? '已设置' : '未设置（使用默认值）')
  console.log('[signJwt] JWT_SECRET length:', JWT_SECRET.length)
  
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_SECONDS)
    .sign(encoder.encode(JWT_SECRET))
  
  console.log('[signJwt] Token 生成成功，长度:', token.length)
  return token
}

export async function verifyJwt(token: string): Promise<AuthUser | null> {
  try {
    console.log('[verifyJwt] 开始验证 token')
    console.log('[verifyJwt] JWT_SECRET 存在:', !!JWT_SECRET)
    console.log('[verifyJwt] JWT_SECRET 长度:', JWT_SECRET?.length || 0)
    
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET))
    
    console.log('[verifyJwt] Token 验证成功')
    console.log('[verifyJwt] Payload:', JSON.stringify(payload, null, 2))
    
    const user = (payload as any).user as AuthUser
    
    if (!user) {
      console.error('[verifyJwt] ❌ Payload 中没有 user 字段')
      return null
    }
    
    console.log('[verifyJwt] ✅ 返回用户:', user.email)
    return user
  } catch (error) {
    console.error('[verifyJwt] ❌ Token 验证失败:', error)
    console.error('[verifyJwt] 错误详情:', error instanceof Error ? error.message : String(error))
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
  // 暂时禁用 secure，因为可能导致 cookie 无法设置
  // Vercel 使用 HTTPS，但某些情况下 secure cookie 可能有问题
  // TODO: 确认生产环境 HTTPS 后可以重新启用 secure
  
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: false, // 暂时禁用 secure 以调试
    sameSite: 'lax',
    path: '/',
    maxAge: JWT_EXPIRES_SECONDS,
  })
  
  // 验证 cookie 是否被设置
  const allCookies = response.headers.get('Set-Cookie')
  
  console.log('[Auth] Cookie 设置尝试:', {
    name: AUTH_COOKIE,
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: JWT_EXPIRES_SECONDS,
    tokenLength: token.length,
    setCookieHeader: allCookies ? '✅ 已设置' : '❌ 未设置'
  })
  
  if (allCookies) {
    console.log('[Auth] Set-Cookie 内容:', allCookies.substring(0, 200))
  }
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


