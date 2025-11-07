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
    
    const jwtUser = await verifyJwt(token)
    
    if (jwtUser) {
      // 获取完整的用户信息（包括积分等）
      const { getUserByEmail } = await import('@/lib/userStore')
      const { checkAndResetCredits } = await import('@/lib/credits')
      
      const fullUser = await getUserByEmail(jwtUser.email)
      if (fullUser) {
        // 检查并重置积分（如果需要）
        const currentCredits = await checkAndResetCredits(jwtUser.email)
        
        console.log('[Auth/Me] ✅ Token 验证成功，用户:', jwtUser.email, 'Plan:', fullUser.plan, 'Credits:', currentCredits)
        
        // 返回完整的用户信息，包括所有订阅相关字段
        return NextResponse.json({ 
          user: {
            ...jwtUser,
            credits: currentCredits,
            plan: fullUser.plan,
            subscriptionExpiresAt: fullUser.subscriptionExpiresAt || null,
            subscriptionStartDate: fullUser.subscriptionStartDate || null,
            subscriptionEndDate: fullUser.subscriptionEndDate || null,
            creditsResetDate: fullUser.creditsResetDate || null,
          } 
        }, { status: 200 })
      }
    }
    
    console.log('[Auth/Me] ❌ Token 验证失败 - verifyJwt 返回 null')
    return NextResponse.json({ user: null, error: 'Token verification failed' }, { status: 200 })
  } catch (error) {
    console.error('[Auth/Me] ❌ 异常:', error)
    console.error('[Auth/Me] 异常堆栈:', error instanceof Error ? error.stack : String(error))
    return NextResponse.json({ user: null, error: String(error) }, { status: 200 })
  }
}
