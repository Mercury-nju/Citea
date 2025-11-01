import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // 只从 Authorization header 读取 token
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    const token = authHeader.substring(7)
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    const user = await verifyJwt(token)
    
    if (user) {
      return NextResponse.json({ user }, { status: 200 })
    } else {
      return NextResponse.json({ user: null }, { status: 200 })
    }
  } catch (error) {
    console.error('[Auth/Me] Error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
