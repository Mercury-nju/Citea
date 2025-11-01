import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // 方式1: 从 cookie 获取 token
    const cookieStore = cookies()
    let token = cookieStore.get('citea_auth')?.value
    
    // 方式2: 从 Authorization header 获取（备用方案）
    if (!token) {
      const authHeader = req.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
        console.log('[Auth/Me] 从 Authorization header 获取 token')
      }
    }
    
    // 方式3: 从 query 参数获取（临时调试）
    if (!token) {
      const url = new URL(req.url)
      token = url.searchParams.get('token') || undefined
      if (token) {
        console.log('[Auth/Me] 从 query 参数获取 token')
      }
    }
    
    console.log('[Auth/Me] Token 检查:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      source: token ? (cookieStore.get('citea_auth') ? 'cookie' : 'header/query') : 'none'
    })
    
    if (!token) {
      console.log('[Auth/Me] ❌ 未找到 token')
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
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
