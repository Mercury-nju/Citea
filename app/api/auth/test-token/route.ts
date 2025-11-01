import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 })
    }
    
    console.log('[TestToken] 测试 token，长度:', token.length)
    console.log('[TestToken] Token 预览:', token.substring(0, 50))
    
    const user = await verifyJwt(token)
    
    return NextResponse.json({ 
      success: !!user,
      user: user,
      message: user ? 'Token is valid' : 'Token verification failed'
    })
  } catch (error) {
    console.error('[TestToken] Error:', error)
    return NextResponse.json({ 
      error: String(error) 
    }, { status: 500 })
  }
}

