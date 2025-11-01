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
    
    // 优先从 Authorization header 获取（因为 cookie 有问题）
    let token: string | undefined = undefined
    let tokenSource = 'none'
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
      tokenSource = 'header'
      console.log('[Auth/Me] ✅ 从 Authorization header 获取 token，长度:', token.length)
    }
    
    // 如果没有 header，再从 cookie 获取
    if (!token) {
      const cookieStore = cookies()
      const cookieToken = cookieStore.get('citea_auth')?.value
      if (cookieToken) {
        token = cookieToken
        tokenSource = 'cookie'
        console.log('[Auth/Me] ✅ 从 cookie 获取 token，长度:', token.length)
      }
    }
    
    // 最后尝试从 query 参数获取（调试用）
    if (!token) {
      const url = new URL(req.url)
      const queryToken = url.searchParams.get('token')
      if (queryToken) {
        token = queryToken
        tokenSource = 'query'
        console.log('[Auth/Me] ✅ 从 query 参数获取 token')
      }
    }
    
    console.log('[Auth/Me] Token 检查结果:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      source: tokenSource,
      tokenPreview: token ? `${token.substring(0, 50)}...` : 'null',
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? `${authHeader.substring(0, 30)}...` : 'null'
    })
    
    if (!token) {
      console.log('[Auth/Me] ❌ 未找到 token')
      return NextResponse.json({ user: null, debug: { 
        tokenSource, 
        hasAuthHeader: !!authHeader,
        authHeaderValue: authHeader || 'null'
      } }, { status: 200 })
    }
    
    console.log('[Auth/Me] 开始验证 token，来源:', tokenSource)
    const user = await verifyJwt(token)
    
    if (user) {
      console.log('[Auth/Me] ✅ 用户验证成功:', user.email)
      return NextResponse.json({ user }, { status: 200 })
    } else {
      console.log('[Auth/Me] ❌ Token 验证失败 - verifyJwt 返回 null')
      console.log('[Auth/Me] Token 内容预览:', token.substring(0, 100))
      return NextResponse.json({ 
        user: null, 
        debug: { 
          tokenSource, 
          tokenLength: token.length,
          tokenPreview: token.substring(0, 50)
        } 
      }, { status: 200 })
    }
  } catch (error) {
    console.error('[Auth/Me] ❌ 异常:', error)
    console.error('[Auth/Me] 异常堆栈:', error instanceof Error ? error.stack : String(error))
    return NextResponse.json({ user: null, error: String(error) }, { status: 200 })
  }
}
