import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const jwtSecret = process.env.JWT_SECRET
  const hasJwtSecret = !!jwtSecret
  const jwtSecretLength = jwtSecret?.length || 0
  
  return NextResponse.json({
    hasJwtSecret,
    jwtSecretLength,
    preview: jwtSecret ? `${jwtSecret.substring(0, 10)}...` : 'Not set',
    message: hasJwtSecret 
      ? 'JWT_SECRET is configured' 
      : 'JWT_SECRET is not set - using default value'
  })
}

