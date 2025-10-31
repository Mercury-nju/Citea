import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.access(USERS_FILE)
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf8')
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await ensureDataFile()
    const raw = await fs.readFile(USERS_FILE, 'utf8')
    const data = JSON.parse(raw || '{"users":[]}') as { users: any[] }
    const existing = data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = { id: randomUUID(), name, email, passwordHash, plan: 'free' }
    data.users.push(user)
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf8')

    const token = await signJwt({ id: user.id, name: user.name, email: user.email, plan: user.plan })
    await setAuthCookie(token)

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, plan: user.plan } }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


