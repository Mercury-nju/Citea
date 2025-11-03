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
  
  // Admin 路由：设置路径名和 URL header 供 layout 使用
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    response.headers.set('x-url', request.url)
    return response
  }
  
  // 获取认证 token
  const token = request.cookies.get('citea_auth')?.value
  
  let isAuthenticated = false
  if (token) {
    try {
      await jwtVerify(token, encoder.encode(JWT_SECRET))
      isAuthenticated = true
      console.log('[Middleware] Token 验证成功')
    } catch (error) {
      isAuthenticated = false
      console.log('[Middleware] Token 验证失败:', error)
    }
  } else {
    console.log('[Middleware] 未找到 token cookie')
  }
  
  // 检查是否访问受保护的路径
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))
  
  // Dashboard 路由由客户端自行处理认证，不在中间件拦截（含子路由）
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }
  
  // 其他受保护路径的检查
  if (isProtectedPath && !isAuthenticated) {
    console.log('[Middleware] 未认证访问受保护路径:', pathname, '-> 重定向到登录页')
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  if (isProtectedPath && isAuthenticated) {
    console.log('[Middleware] 已认证用户访问:', pathname, '-> 允许访问')
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

