import { promises as fs } from 'fs'
import path from 'path'
import type { AuthUser } from './auth'
import Redis from 'ioredis'

// Import Vercel KV - it will use env vars automatically when available
let kv: any = null
let redis: Redis | null = null
try {
  const kvModule = require('@vercel/kv')
  kv = kvModule
} catch {
  // KV not available (local dev without env vars)
}

// Initialize Redis if REDIS_URL is provided
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL as string)
}

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

export type StoredUser = AuthUser & { 
  passwordHash: string
  createdAt?: string
  lastLoginAt?: string
}

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
  // Try Redis if available
  if (redis) {
    try {
      const data = await redis.hgetall(`user:${email.toLowerCase()}`)
      if (!data || Object.keys(data).length === 0) return null
      // Redis returns string fields; parse where needed
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        plan: (data.plan as any) || 'free',
        passwordHash: data.passwordHash,
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt,
      }
    } catch (error) {
      console.error('Redis read error:', error)
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
  // Try Redis if available
  if (redis) {
    try {
      const key = `user:${user.email.toLowerCase()}`
      await redis.hset(key, {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLoginAt: user.lastLoginAt || new Date().toISOString(),
      })
      return
    } catch (error) {
      console.error('Redis write error:', error)
      throw new Error(`Failed to save user to Redis: ${error}`)
    }
  }
  
  // Check if we're in production without KV configured
  if (process.env.VERCEL) {
    throw new Error('Database not configured. Please set up Vercel KV or REDIS_URL in production.')
  }
  
  // Fallback to file storage (local dev)
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  json.users.push(user)
  await fs.writeFile(USERS_FILE, JSON.stringify(json, null, 2), 'utf8')
}

export async function updateUserLastLogin(email: string): Promise<void> {
  // Check if KV is available
  if (kv && process.env.KV_REST_API_URL) {
    try {
      await kv.hset(`user:${email.toLowerCase()}`, {
        lastLoginAt: new Date().toISOString()
      })
      return
    } catch (error) {
      console.error('KV update error:', error)
    }
  }
  
  // Try Redis if available
  if (redis) {
    try {
      await redis.hset(`user:${email.toLowerCase()}`, 'lastLoginAt', new Date().toISOString())
      return
    } catch (error) {
      console.error('Redis update error:', error)
    }
  }
  
  // Fallback to file storage
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  const user = json.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (user) {
    user.lastLoginAt = new Date().toISOString()
    await fs.writeFile(USERS_FILE, JSON.stringify(json, null, 2), 'utf8')
  }
}


