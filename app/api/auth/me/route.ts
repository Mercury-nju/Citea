import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthTokenFromCookies, verifyJwt } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 获取所有 cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // 查找 citea_auth cookie
    const authCookie = cookieStore.get('citea_auth')
    
    console.log('[Auth/Me] Cookie 检查:', {
      totalCookies: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
      hasCiteaAuth: !!authCookie,
      authCookieValue: authCookie ? `${authCookie.value.substring(0, 30)}...` : 'null'
    })
    
    if (!authCookie) {
      console.log('[Auth/Me] ❌ 未找到 citea_auth cookie')
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    const token = authCookie.value
    console.log('[Auth/Me] Token 提取成功，长度:', token.length)
    
    const user = await verifyJwt(token)
    
    if (user) {
      console.log('[Auth/Me] ✅ 用户验证成功:', user.email)
      return NextResponse.json({ user }, { status: 200 })
    } else {
      console.log('[Auth/Me] ❌ Token 验证失败')
      return NextResponse.json({ user: null }, { status: 200 })
    }
  } catch (error) {
    console.error('[Auth/Me] ❌ 异常:', error)
    return NextResponse.json({ user: null, error: String(error) }, { status: 200 })
  }
}
