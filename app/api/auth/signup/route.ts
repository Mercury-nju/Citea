import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { createUser, getUserByEmail } from '@/lib/userStore'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const existing = await getUserByEmail(String(email))
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = { id: randomUUID(), name, email, passwordHash, plan: 'free' }
    await createUser(user)

    const token = await signJwt({ id: user.id, name: user.name, email: user.email, plan: user.plan })
    await setAuthCookie(token)

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan } }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


