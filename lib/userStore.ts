import { promises as fs } from 'fs'
import path from 'path'
import type { AuthUser } from './auth'

// Import Vercel KV - it will use env vars automatically when available
let kv: any = null
try {
  const kvModule = require('@vercel/kv')
  kv = kvModule
} catch {
  // KV not available (local dev without env vars)
}

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
  // Check if KV is available (production with env vars)
  if (kv && process.env.KV_REST_API_URL) {
    try {
      const data = await kv.hgetall(`user:${email.toLowerCase()}`)
      return data || null
    } catch (error) {
      console.error('KV read error:', error)
      throw error
    }
  }
  
  // Fallback to file storage (local dev)
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  return json.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createUser(user: StoredUser): Promise<void> {
  // Check if KV is available (production with env vars)
  if (kv && process.env.KV_REST_API_URL) {
    try {
      console.log('Saving user to KV:', user.email)
      await kv.hset(`user:${user.email.toLowerCase()}`, user)
      console.log('User saved successfully to KV')
      return
    } catch (error) {
      console.error('KV write error:', error)
      throw new Error(`Failed to save user to database: ${error}`)
    }
  }
  
  // Check if we're in production without KV configured
  if (process.env.VERCEL) {
    throw new Error('Database not configured. Please set up Vercel KV in production.')
  }
  
  // Fallback to file storage (local dev)
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  json.users.push(user)
  await fs.writeFile(USERS_FILE, JSON.stringify(json, null, 2), 'utf8')
}


