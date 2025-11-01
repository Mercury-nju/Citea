import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasJwtSecret = !!process.env.JWT_SECRET
  const jwtSecretLength = process.env.JWT_SECRET?.length || 0
  
  return NextResponse.json({
    hasJwtSecret,
    jwtSecretLength,
    preview: hasJwtSecret ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'Not set',
    message: hasJwtSecret 
      ? 'JWT_SECRET is configured' 
      : 'JWT_SECRET is not set - using default value'
  })
}

