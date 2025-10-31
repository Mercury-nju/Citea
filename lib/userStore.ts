import { promises as fs } from 'fs'
import path from 'path'
import type { AuthUser } from './auth'

let kv: any = null
try {
  // Optional dependency; only works in production if env is configured
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  kv = require('@vercel/kv')
} catch {}

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

export type StoredUser = AuthUser & { passwordHash: string }

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.access(USERS_FILE)
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf8')
  }
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  if (kv?.kv) {
    const data = await kv.kv.hgetall(`user:${email.toLowerCase()}`)
    return (data as StoredUser) || null
  }
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  return json.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createUser(user: StoredUser): Promise<void> {
  if (kv?.kv) {
    await kv.kv.hset(`user:${user.email.toLowerCase()}`, user)
    return
  }
  
  // Check if we're in a serverless environment without write access
  if (process.env.VERCEL && !kv?.kv) {
    throw new Error('Database not configured. Please set up Vercel KV in production.')
  }
  
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  json.users.push(user)
  await fs.writeFile(USERS_FILE, JSON.stringify(json, null, 2), 'utf8')
}


