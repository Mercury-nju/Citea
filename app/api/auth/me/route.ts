import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // 检查所有请求头
    const authHeader = req.headers.get('Authorization')
    console.log('[Auth/Me] Authorization header:', authHeader || '无')
    console.log('[Auth/Me] 所有 headers:', {
      authorization: authHeader,
      contentType: req.headers.get('Content-Type'),
    })
    
    // 方式1: 从 cookie 获取 token
    const cookieStore = cookies()
    let token = cookieStore.get('citea_auth')?.value
    let tokenSource = 'none'
    
    if (token) {
      tokenSource = 'cookie'
      console.log('[Auth/Me] ✅ 从 cookie 获取 token，长度:', token.length)
    }
    
    // 方式2: 从 Authorization header 获取（备用方案）
    if (!token && authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
        tokenSource = 'header'
        console.log('[Auth/Me] ✅ 从 Authorization header 获取 token，长度:', token.length)
      } else {
        console.log('[Auth/Me] ⚠️ Authorization header 格式不正确:', authHeader.substring(0, 20))
      }
    }
    
    console.log('[Auth/Me] Token 检查结果:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      source: tokenSource,
      tokenPreview: token ? `${token.substring(0, 30)}...` : 'null'
    })
    
    if (!token) {
      console.log('[Auth/Me] ❌ 未找到 token')
      return NextResponse.json({ user: null, debug: { tokenSource, hasAuthHeader: !!authHeader } }, { status: 200 })
    }
    
    console.log('[Auth/Me] 开始验证 token...')
    const user = await verifyJwt(token)
    
    if (user) {
      console.log('[Auth/Me] ✅ 用户验证成功:', user.email)
      return NextResponse.json({ user }, { status: 200 })
    } else {
      console.log('[Auth/Me] ❌ Token 验证失败 - verifyJwt 返回 null')
      return NextResponse.json({ user: null, debug: { tokenSource, tokenLength: token.length } }, { status: 200 })
    }
  } catch (error) {
    console.error('[Auth/Me] ❌ 异常:', error)
    console.error('[Auth/Me] 异常堆栈:', error instanceof Error ? error.stack : String(error))
    return NextResponse.json({ user: null, error: String(error) }, { status: 200 })
  }
}
