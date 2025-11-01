import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // 只从 Authorization header 读取 token
    const authHeader = req.headers.get('Authorization')
    
    console.log('[Auth/Me] Authorization header:', authHeader ? '存在' : '不存在')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth/Me] ❌ Authorization header 格式不正确或不存在')
      return NextResponse.json({ user: null, error: 'No Authorization header' }, { status: 200 })
    }
    
    const token = authHeader.substring(7)
    
    if (!token) {
      console.log('[Auth/Me] ❌ Token 为空')
      return NextResponse.json({ user: null, error: 'Empty token' }, { status: 200 })
    }
    
    console.log('[Auth/Me] Token 长度:', token.length)
    console.log('[Auth/Me] 开始验证 token...')
    
    const user = await verifyJwt(token)
    
    if (user) {
      console.log('[Auth/Me] ✅ Token 验证成功，用户:', user.email)
      return NextResponse.json({ user }, { status: 200 })
    } else {
      console.log('[Auth/Me] ❌ Token 验证失败 - verifyJwt 返回 null')
      return NextResponse.json({ user: null, error: 'Token verification failed' }, { status: 200 })
    }
  } catch (error) {
    console.error('[Auth/Me] ❌ 异常:', error)
    console.error('[Auth/Me] 异常堆栈:', error instanceof Error ? error.stack : String(error))
    return NextResponse.json({ user: null, error: String(error) }, { status: 200 })
  }
}
