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
      if (type === 'subscription.activated' || type === 'checkout.completed') {
        const limits = getPlanLimits(planFromProduct as any)
        await updateUser(metaEmail, {
          plan: planFromProduct as any,
          subscriptionStartDate: new Date().toISOString(),
          credits: limits.maxCredits,
        })
      }
      if (type === 'subscription.canceled') {
        const limits = getPlanLimits('free')
        await updateUser(metaEmail, {
          plan: 'free',
          subscriptionEndDate: new Date().toISOString(),
          credits: Math.min(limits.maxCredits, limits.maxCredits),
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Creem webhook error:', err)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}


