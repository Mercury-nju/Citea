import { NextRequest, NextResponse } from 'next/server'
import { updateUser, getUserByEmail, createUser } from '@/lib/userStore'
import { getPlanLimits } from '@/lib/credits'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// Minimal webhook receiver for Creem. Replace logic to fit your user model.
export async function POST(request: NextRequest) {
  try {
    const event = await request.json()
    // TODO: verify signature if Creem provides one in the future
    console.log('[Creem webhook] event:', JSON.stringify(event))

    const type = event?.type
    // 尝试从多个地方获取邮箱（Creem 可能在不同的字段中）
    const metaEmail = event?.data?.metadata?.email || 
                     event?.data?.customer?.email || 
                     event?.data?.email ||
                     event?.customer?.email ||
                     event?.metadata?.email
    const productId = event?.data?.product_id || event?.product_id
    
    console.log('[Webhook] Event details:', {
      type,
      metaEmail,
      productId,
      hasMetadata: !!event?.data?.metadata,
      hasCustomer: !!event?.data?.customer,
      eventKeys: Object.keys(event || {}),
    })

    // Map product_id -> plan
    const MONTHLY_ID = process.env.CREEM_PRODUCT_ID_MONTHLY || 'prod_6hdXzIZTTl6397GcDmgDc3'
    const YEARLY_ID = process.env.CREEM_PRODUCT_ID_YEARLY || 'prod_gg235rl7HEDxGtAwv5bJ6'
    const planFromProduct = productId === YEARLY_ID ? 'yearly' : productId === MONTHLY_ID ? 'monthly' : 'monthly'
    if (metaEmail) {
      const normalizedEmail = metaEmail.toLowerCase().trim()
      
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
        
        console.log(`[Webhook] Processing payment for ${normalizedEmail} - Plan: ${planFromProduct}`)
        console.log(`[Webhook] Credits: ${limits.maxCredits}, Expires: ${subscriptionExpiresAt.toISOString()}`)
        
        // 检查用户是否存在
        let user = await getUserByEmail(normalizedEmail)
        
        if (!user) {
          // 用户不存在，创建新用户（未注册用户支付后自动创建账户）
          console.log(`[Webhook] User ${normalizedEmail} does not exist, creating new account...`)
          
          // 生成随机密码（用户可以通过邮箱重置密码）
          const tempPassword = uuidv4() + Date.now().toString()
          const passwordHash = await bcrypt.hash(tempPassword, 10)
          
          const newUser = {
            id: uuidv4(),
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0] || 'User',
            passwordHash: passwordHash,
            plan: planFromProduct as any,
            credits: limits.maxCredits,
            creditsResetDate: creditsResetDate,
            subscriptionStartDate: subscriptionStartDate,
            subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
            emailVerified: true, // 支付即验证邮箱
            createdAt: now.toISOString(),
            lastLoginAt: now.toISOString(),
            authProvider: 'email' as const,
          }
          
          await createUser(newUser)
          console.log(`[Webhook] ✅ New user account created for ${normalizedEmail} with ${planFromProduct} plan`)
        } else {
          // 用户已存在，更新权益
          console.log(`[Webhook] User ${normalizedEmail} exists, upgrading to ${planFromProduct} plan`)
          
          await updateUser(normalizedEmail, {
            plan: planFromProduct as any,
            subscriptionStartDate: subscriptionStartDate,
            subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
            credits: limits.maxCredits,
            creditsResetDate: creditsResetDate,
            emailVerified: true, // 确保邮箱已验证
          })
          
          console.log(`[Webhook] ✅ User ${normalizedEmail} successfully upgraded to ${planFromProduct}`)
        }
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
        
        console.log(`[Webhook] Renewing subscription for user ${normalizedEmail}`)
        
        // 检查用户是否存在
        let user = await getUserByEmail(normalizedEmail)
        if (!user) {
          console.error(`[Webhook] ⚠️ User ${normalizedEmail} not found for renewal, creating account...`)
          // 如果用户不存在，创建账户（不应该发生，但作为保险）
          const tempPassword = uuidv4() + Date.now().toString()
          const passwordHash = await bcrypt.hash(tempPassword, 10)
          
          const newUser = {
            id: uuidv4(),
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0] || 'User',
            passwordHash: passwordHash,
            plan: planFromProduct as any,
            credits: limits.maxCredits,
            creditsResetDate: creditsResetDate,
            subscriptionStartDate: now.toISOString(),
            subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
            emailVerified: true,
            createdAt: now.toISOString(),
            lastLoginAt: now.toISOString(),
            authProvider: 'email' as const,
          }
          
          await createUser(newUser)
          console.log(`[Webhook] ✅ Account created during renewal for ${normalizedEmail}`)
        } else {
          await updateUser(normalizedEmail, {
            plan: planFromProduct as any,
            subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
            credits: limits.maxCredits, // 续费时重置积分
            creditsResetDate: creditsResetDate,
          })
          console.log(`[Webhook] ✅ Subscription renewed for user ${normalizedEmail}`)
        }
      }
      
      // 处理订阅取消事件
      if (type === 'subscription.canceled' || type === 'subscription.expired') {
        const limits = getPlanLimits('free')
        const { calculateNextResetDate } = await import('@/lib/credits')
        const user = await getUserByEmail(normalizedEmail)
        
        if (user) {
          const creditsResetDate = calculateNextResetDate('free').toISOString()
          
          console.log(`[Webhook] Downgrading user ${normalizedEmail} to free plan`)
          
          await updateUser(normalizedEmail, {
            plan: 'free',
            subscriptionEndDate: new Date().toISOString(),
            subscriptionExpiresAt: '', // 清除过期时间
            credits: limits.maxCredits,
            creditsResetDate: creditsResetDate,
          })
          
          console.log(`[Webhook] ✅ User ${normalizedEmail} downgraded to free plan`)
        } else {
          console.warn(`[Webhook] ⚠️ User ${normalizedEmail} not found for cancellation`)
        }
      }
    } else {
      console.warn('[Webhook] ⚠️ No email found in webhook event:', JSON.stringify(event))
    }

    return NextResponse.json({ 
      received: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('[Webhook] ❌ Error:', err)
    console.error('[Webhook] Error stack:', err instanceof Error ? err.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Bad Request',
      message: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
}


