import { NextResponse } from 'next/server'
import { getAuthTokenFromCookies, verifyJwt } from '@/lib/auth'

export async function GET() {
  const token = getAuthTokenFromCookies()
  if (!token) return NextResponse.json({ user: null }, { status: 200 })
  const user = await verifyJwt(token)
  return NextResponse.json({ user: user || null }, { status: 200 })
}


