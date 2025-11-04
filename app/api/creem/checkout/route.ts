import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'
import { getUserByEmail } from '@/lib/userStore'

// Create a Creem checkout session and redirect the user
export async function GET(request: NextRequest) {
  try {
    const CREEM_API_KEY = process.env.CREEM_API_KEY
    if (!CREEM_API_KEY) {
      return NextResponse.json({ error: 'Missing CREEM_API_KEY' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan') || undefined
    const productId =
      searchParams.get('product_id') ||
      (plan === 'yearly'
        ? process.env.CREEM_PRODUCT_ID_YEARLY
        : plan === 'monthly'
        ? process.env.CREEM_PRODUCT_ID_MONTHLY
        : process.env.CREEM_PRODUCT_ID)
    if (!productId) {
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 })
    }

    const origin = request.nextUrl.origin

    // Try to attach user email as metadata for webhook mapping
    let userEmail: string | undefined
    try {
      const token = cookies().get('citea_auth')?.value
      if (token) {
        const jwt = await verifyJwt(token)
        if (jwt?.email) {
          const user = await getUserByEmail(jwt.email)
          userEmail = user?.email
        }
      }
    } catch {}

    // Optional debug: /api/creem/checkout?plan=monthly&debug=1  → 返回解析结果而不调用 Creem
    if (searchParams.get('debug') === '1') {
      return NextResponse.json({
        plan: plan || null,
        productId,
        hasApiKey: !!CREEM_API_KEY,
        origin,
      })
    }

    const payload: any = {
      product_id: productId,
      success_url: `${origin}/billing/success`,
      cancel_url: `${origin}/billing/cancel`,
    }
    if (userEmail) payload.metadata = { email: userEmail }

    const resp = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error('Creem checkout failed:', { status: resp.status, body: text, productId, plan })
      return NextResponse.json({ error: 'Failed to create checkout', detail: text, status: resp.status }, { status: 500 })
    }

    const data = (await resp.json()) as { checkout_url?: string }
    if (!data.checkout_url) {
      return NextResponse.json({ error: 'No checkout_url in response' }, { status: 500 })
    }

    return NextResponse.redirect(data.checkout_url, { status: 302 })
  } catch (err) {
    console.error('Creem checkout error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


