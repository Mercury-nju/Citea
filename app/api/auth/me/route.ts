import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthTokenFromCookies, verifyJwt } from '@/lib/auth'

export async function GET() {
  try {
    // 检查所有 cookies（用于调试）
    const allCookies = cookies()
    const authCookie = allCookies.get('citea_auth')
    
    console.log('[Auth/Me] Cookie 检查:', {
      hasAuthCookie: !!authCookie,
      cookieValue: authCookie ? `${authCookie.value.substring(0, 20)}...` : 'null',
      allCookieNames: Array.from(allCookies.getAll().map(c => c.name))
    })
    
    const token = getAuthTokenFromCookies()
    console.log('[Auth/Me] Token 提取:', token ? `长度 ${token.length}` : 'null')
    
    if (!token) {
      console.log('[Auth/Me] ❌ 未找到 token')
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    const user = await verifyJwt(token)
    console.log('[Auth/Me] Token 验证:', user ? `✅ 成功 - ${user.email}` : '❌ 失败')
    
    return NextResponse.json({ user: user || null }, { status: 200 })
  } catch (error) {
    console.error('[Auth/Me] 错误:', error)
    return NextResponse.json({ user: null, error: String(error) }, { status: 200 })
  }
}


