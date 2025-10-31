import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { getUserByEmail } from '@/lib/userStore'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }
    const user = await getUserByEmail(String(email))
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signJwt({ id: user.id, name: user.name, email: user.email, plan: user.plan })
    await setAuthCookie(token)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan } })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


