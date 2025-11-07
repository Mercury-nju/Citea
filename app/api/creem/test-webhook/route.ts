import { NextRequest, NextResponse } from 'next/server'

/**
 * 测试 webhook 连接和支付流程
 * 这个端点用于测试支付系统是否正常工作
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email') || 'test@example.com'
    
    // 检查环境变量
    const hasApiKey = !!process.env.CREEM_API_KEY
    const monthlyId = process.env.CREEM_PRODUCT_ID_MONTHLY
    const yearlyId = process.env.CREEM_PRODUCT_ID_YEARLY
    
    // 模拟 webhook 事件
    const testEvent = {
      type: 'checkout.completed',
      data: {
        customer: {
          email: testEmail
        },
        product_id: monthlyId,
        metadata: {
          email: testEmail
        }
      }
    }
    
    return NextResponse.json({
      status: 'ok',
      message: 'Webhook test endpoint',
      config: {
        hasApiKey,
        monthlyProductId: monthlyId,
        yearlyProductId: yearlyId,
        webhookUrl: `${request.nextUrl.origin}/api/creem/webhook`,
      },
      testEvent,
      instructions: {
        step1: 'Ensure CREEM_API_KEY is set in environment variables',
        step2: 'Ensure CREEM_PRODUCT_ID_MONTHLY and CREEM_PRODUCT_ID_YEARLY are set',
        step3: 'Configure webhook URL in Creem dashboard: ' + `${request.nextUrl.origin}/api/creem/webhook`,
        step4: 'Test payment flow by completing a checkout',
        step5: 'Check webhook logs in Vercel dashboard',
      }
    })
  } catch (err) {
    console.error('Test webhook error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * 模拟 webhook 事件（仅用于测试）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, plan = 'monthly', eventType = 'checkout.completed' } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // 转发到实际的 webhook
    const webhookUrl = `${request.nextUrl.origin}/api/creem/webhook`
    const MONTHLY_ID = process.env.CREEM_PRODUCT_ID_MONTHLY || 'prod_6hdXzIZTTl6397GcDmgDc3'
    const YEARLY_ID = process.env.CREEM_PRODUCT_ID_YEARLY || 'prod_gg235rl7HEDxGtAwv5bJ6'
    
    const testEvent = {
      type: eventType,
      data: {
        customer: {
          email: email
        },
        product_id: plan === 'yearly' ? YEARLY_ID : MONTHLY_ID,
        metadata: {
          email: email
        }
      }
    }
    
    // 调用 webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent),
    })
    
    const result = await response.json()
    
    return NextResponse.json({
      status: 'ok',
      message: 'Test webhook event sent',
      testEvent,
      webhookResponse: result,
    })
  } catch (err) {
    console.error('Test webhook POST error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

