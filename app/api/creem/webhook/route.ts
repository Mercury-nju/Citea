import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/userStore'
import { getPlanLimits } from '@/lib/credits'

// Minimal webhook receiver for Creem. Replace logic to fit your user model.
export async function POST(request: NextRequest) {
  try {
    const event = await request.json()
    // TODO: verify signature if Creem provides one in the future
    console.log('[Creem webhook] event:', JSON.stringify(event))

    const type = event?.type
    const metaEmail = event?.data?.metadata?.email || event?.data?.customer?.email
    const productId = event?.data?.product_id

    // Map product_id -> plan
    const MONTHLY_ID = process.env.CREEM_PRODUCT_ID_MONTHLY || 'prod_6hdXzIZTTl6397GcDmgDc3'
    const YEARLY_ID = process.env.CREEM_PRODUCT_ID_YEARLY || 'prod_gg235rl7HEDxGtAwv5bJ6'
    const planFromProduct = productId === YEARLY_ID ? 'yearly' : productId === MONTHLY_ID ? 'monthly' : 'monthly'
    if (metaEmail) {
      // 处理支付成功和订阅激活事件
      if (type === 'subscription.activated' || type === 'checkout.completed' || type === 'payment.succeeded') {
        const limits = getPlanLimits(planFromProduct as any)
        const now = new Date()
        const subscriptionStartDate = now.toISOString()
        
        // 计算订阅过期时间
        const subscriptionExpiresAt = new Date(now)
        if (planFromProduct === 'yearly') {
          subscriptionExpiresAt.setFullYear(subscriptionExpiresAt.getFullYear() + 1)
        } else {
          subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1)
        }
        
        // 计算积分重置日期
        const { calculateNextResetDate } = await import('@/lib/credits')
        const creditsResetDate = calculateNextResetDate(planFromProduct as any).toISOString()
        
        console.log(`[Webhook] Upgrading user ${metaEmail} to ${planFromProduct} plan`)
        console.log(`[Webhook] Credits: ${limits.maxCredits}, Expires: ${subscriptionExpiresAt.toISOString()}`)
        
        await updateUser(metaEmail, {
          plan: planFromProduct as any,
          subscriptionStartDate: subscriptionStartDate,
          subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
          credits: limits.maxCredits,
          creditsResetDate: creditsResetDate,
        })
        
        console.log(`[Webhook] ✅ User ${metaEmail} successfully upgraded to ${planFromProduct}`)
      }
      
      // 处理订阅续费事件
      if (type === 'subscription.renewed' || type === 'subscription.updated') {
        const limits = getPlanLimits(planFromProduct as any)
        const now = new Date()
        
        // 更新订阅过期时间
        const subscriptionExpiresAt = new Date(now)
        if (planFromProduct === 'yearly') {
          subscriptionExpiresAt.setFullYear(subscriptionExpiresAt.getFullYear() + 1)
        } else {
          subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1)
        }
        
        // 计算积分重置日期
        const { calculateNextResetDate } = await import('@/lib/credits')
        const creditsResetDate = calculateNextResetDate(planFromProduct as any).toISOString()
        
        console.log(`[Webhook] Renewing subscription for user ${metaEmail}`)
        
        await updateUser(metaEmail, {
          plan: planFromProduct as any,
          subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
          credits: limits.maxCredits, // 续费时重置积分
          creditsResetDate: creditsResetDate,
        })
        
        console.log(`[Webhook] ✅ Subscription renewed for user ${metaEmail}`)
      }
      
      // 处理订阅取消事件
      if (type === 'subscription.canceled' || type === 'subscription.expired') {
        const limits = getPlanLimits('free')
        const { getUserByEmail } = await import('@/lib/userStore')
        const { calculateNextResetDate } = await import('@/lib/credits')
        const user = await getUserByEmail(metaEmail)
        
        if (user) {
          const creditsResetDate = calculateNextResetDate('free').toISOString()
          
          console.log(`[Webhook] Downgrading user ${metaEmail} to free plan`)
          
          await updateUser(metaEmail, {
            plan: 'free',
            subscriptionEndDate: new Date().toISOString(),
            subscriptionExpiresAt: '', // 清除过期时间
            credits: limits.maxCredits,
            creditsResetDate: creditsResetDate,
          })
          
          console.log(`[Webhook] ✅ User ${metaEmail} downgraded to free plan`)
        }
      }
    } else {
      console.warn('[Webhook] ⚠️ No email found in webhook event:', JSON.stringify(event))
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Creem webhook error:', err)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}


