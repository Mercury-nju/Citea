import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// 需要认证的路径
const protectedPaths = ['/dashboard']

// 已登录用户不应访问的路径
const authPaths = ['/auth/signin', '/auth/signup']

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const encoder = new TextEncoder()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 获取认证 token
  const token = request.cookies.get('citea_auth')?.value
  
  let isAuthenticated = false
  if (token) {
    try {
      await jwtVerify(token, encoder.encode(JWT_SECRET))
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }
  
  // 检查是否访问受保护的路径
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))
  
  // 未登录用户访问受保护路径 -> 重定向到登录页
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // 已登录用户访问登录/注册页 -> 重定向到控制台
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

