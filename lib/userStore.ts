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
// Support both standard Redis URL (redis://) and Upstash REST URL
if (process.env.REDIS_URL) {
  const redisUrl = process.env.REDIS_URL as string
  // Only initialize if it's a standard Redis protocol URL (not REST API)
  if (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) {
    try {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            return null // Stop retrying
          }
          return Math.min(times * 50, 2000)
        }
      })
      // Test connection
      redis.on('error', (err) => {
        console.error('Redis connection error:', err)
      })
      redis.on('connect', () => {
        console.log('Redis connected successfully')
      })
    } catch (error) {
      console.error('Failed to initialize Redis:', error)
      redis = null
    }
  } else {
    console.warn('REDIS_URL is not a standard Redis protocol URL. Upstash REST API is not directly supported by ioredis.')
    console.warn('Please use REDIS_URL with format: redis://... or rediss://...')
    console.warn('For Upstash REST API, consider using @upstash/redis package instead.')
  }
}

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

export type PlanType = 'free' | 'weekly' | 'monthly' | 'yearly'

export type StoredUser = AuthUser & { 
  passwordHash: string
  createdAt?: string
  lastLoginAt?: string
  emailVerified?: boolean
  verificationCode?: string
  verificationExpiry?: string
  plan: PlanType
  credits: number // 当前积分
  creditsResetDate?: string // 积分重置日期（ISO string）
  subscriptionStartDate?: string // 订阅开始日期
  subscriptionEndDate?: string // 订阅结束日期
  authProvider?: 'email' | 'google' // 认证提供者
  googleId?: string // Google 用户 ID
  avatar?: string // 用户头像 URL
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
  const normalizedEmail = email.toLowerCase()
  console.log('getUserByEmail: searching for', normalizedEmail)
  
  // Check if KV is available (production with env vars)
  if (kv && process.env.KV_REST_API_URL) {
    try {
      const key = `user:${normalizedEmail}`
      console.log('KV: looking up key', key)
      const data = await kv.hgetall(key)
      console.log('KV: received data', data ? Object.keys(data) : 'null/empty')
      
      // KV hgetall returns empty object {} if key doesn't exist
      if (!data || Object.keys(data).length === 0 || !data.id) {
        console.log('KV: user not found')
        return null
      }
      
      // KV returns all fields as-is
      const userPlan = ((data.plan as any) || 'free') as PlanType
      const { getPlanLimits } = await import('./credits')
      const defaultCredits = getPlanLimits(userPlan).maxCredits
      
      const user = {
        id: data.id as string,
        name: data.name as string,
        email: data.email as string,
        plan: userPlan,
        passwordHash: data.passwordHash as string,
        createdAt: data.createdAt as string | undefined,
        lastLoginAt: data.lastLoginAt as string | undefined,
        emailVerified: (data.emailVerified as any) === 'true' || (data.emailVerified as any) === true || data.emailVerified === true,
        verificationCode: data.verificationCode as string | undefined,
        verificationExpiry: data.verificationExpiry as string | undefined,
        credits: data.credits ? parseInt(data.credits as string, 10) : defaultCredits,
        creditsResetDate: data.creditsResetDate as string | undefined,
        subscriptionStartDate: data.subscriptionStartDate as string | undefined,
        subscriptionEndDate: data.subscriptionEndDate as string | undefined,
        authProvider: (data.authProvider as 'email' | 'google') || 'email',
        googleId: data.googleId as string | undefined,
        avatar: data.avatar as string | undefined,
      }
      
      if (!user.passwordHash) {
        console.error('KV: user found but passwordHash is missing!')
        return null
      }
      
      console.log('KV: user found', { email: user.email, hasPasswordHash: !!user.passwordHash, emailVerified: user.emailVerified })
      return user
    } catch (error) {
      console.error('KV read error:', error)
      throw error
    }
  }
  // Try Redis if available
  if (redis) {
    try {
      const key = `user:${normalizedEmail}`
      console.log('Redis: looking up key', key)
      const data = await redis.hgetall(key)
      console.log('Redis: received data', data ? Object.keys(data) : 'null/empty')
      
      if (!data || Object.keys(data).length === 0 || !data.id) {
        console.log('Redis: user not found')
        return null
      }
      
      // Redis returns string fields; parse where needed
      const userPlan = ((data.plan as any) || 'free') as PlanType
      const { getPlanLimits } = await import('./credits')
      const defaultCredits = getPlanLimits(userPlan).maxCredits
      
      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        plan: userPlan,
        passwordHash: data.passwordHash,
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt,
        emailVerified: (data.emailVerified as any) === 'true' || (data.emailVerified as any) === true,
        verificationCode: data.verificationCode,
        verificationExpiry: data.verificationExpiry,
        credits: data.credits ? parseInt(data.credits, 10) : defaultCredits,
        creditsResetDate: data.creditsResetDate,
        subscriptionStartDate: data.subscriptionStartDate,
        subscriptionEndDate: data.subscriptionEndDate,
        authProvider: (data.authProvider as 'email' | 'google') || 'email',
        googleId: data.googleId,
        avatar: data.avatar,
      }
      
      if (!user.passwordHash) {
        console.error('Redis: user found but passwordHash is missing!')
        return null
      }
      
      console.log('Redis: user found', { email: user.email, hasPasswordHash: !!user.passwordHash, emailVerified: user.emailVerified })
      return user
    } catch (error) {
      console.error('Redis read error:', error)
      throw error
    }
  }
  
  // Fallback to file storage (local dev)
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  const user = json.users.find(u => u.email.toLowerCase() === normalizedEmail) || null
  console.log('File storage: user', user ? 'found' : 'not found')
  return user
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
        emailVerified: user.emailVerified ? 'true' : 'false',
        verificationCode: user.verificationCode || '',
        verificationExpiry: user.verificationExpiry || '',
        credits: (user.credits || 0).toString(),
        creditsResetDate: user.creditsResetDate || '',
        subscriptionStartDate: user.subscriptionStartDate || '',
        subscriptionEndDate: user.subscriptionEndDate || '',
        authProvider: user.authProvider || 'email',
        googleId: user.googleId || '',
        avatar: user.avatar || '',
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

export async function updateUserVerification(email: string, code: string, expiry: string): Promise<void> {
  // Check if KV is available
  if (kv && process.env.KV_REST_API_URL) {
    try {
      await kv.hset(`user:${email.toLowerCase()}`, {
        verificationCode: code,
        verificationExpiry: expiry
      })
      return
    } catch (error) {
      console.error('KV update error:', error)
    }
  }
  
  // Try Redis if available
  if (redis) {
    try {
      const key = `user:${email.toLowerCase()}`
      await redis.hset(key, {
        verificationCode: code,
        verificationExpiry: expiry
      })
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
    user.verificationCode = code
    user.verificationExpiry = expiry
    await fs.writeFile(USERS_FILE, JSON.stringify(json, null, 2), 'utf8')
  }
}

export async function verifyUserEmail(email: string, code: string): Promise<boolean> {
  const user = await getUserByEmail(email)
  if (!user) return false
  
  // Check if code matches
  if (user.verificationCode !== code) {
    return false
  }
  
  // Check if code expired
  if (user.verificationExpiry && new Date(user.verificationExpiry) < new Date()) {
    return false
  }
  
  // Mark as verified
  if (kv && process.env.KV_REST_API_URL) {
    try {
      await kv.hset(`user:${email.toLowerCase()}`, {
        emailVerified: true,
        verificationCode: '',
        verificationExpiry: ''
      })
      return true
    } catch (error) {
      console.error('KV verification error:', error)
    }
  }
  
  if (redis) {
    try {
      await redis.hset(`user:${email.toLowerCase()}`, {
        emailVerified: 'true',
        verificationCode: '',
        verificationExpiry: ''
      })
      return true
    } catch (error) {
      console.error('Redis verification error:', error)
    }
  }
  
  // File storage
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  const fileUser = json.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (fileUser) {
    fileUser.emailVerified = true
    fileUser.verificationCode = ''
    fileUser.verificationExpiry = ''
    await fs.writeFile(USERS_FILE, JSON.stringify(json, null, 2), 'utf8')
    return true
  }
  
  return false
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

/**
 * 更新用户信息（支持部分更新）
 */
export async function updateUser(email: string, updates: Partial<StoredUser>): Promise<void> {
  const user = await getUserByEmail(email)
  if (!user) {
    throw new Error('User not found')
  }

  const updatedUser = { ...user, ...updates }

  // Check if KV is available
  if (kv && process.env.KV_REST_API_URL) {
    try {
      await kv.hset(`user:${email.toLowerCase()}`, updatedUser)
      return
    } catch (error) {
      console.error('KV update error:', error)
      throw error
    }
  }

  // Try Redis if available
  if (redis) {
    try {
      const key = `user:${email.toLowerCase()}`
      const dataToStore: any = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,
        passwordHash: updatedUser.passwordHash,
        createdAt: updatedUser.createdAt || new Date().toISOString(),
        lastLoginAt: updatedUser.lastLoginAt || new Date().toISOString(),
        emailVerified: updatedUser.emailVerified ? 'true' : 'false',
        verificationCode: updatedUser.verificationCode || '',
        verificationExpiry: updatedUser.verificationExpiry || '',
      }
      
      // 添加积分相关字段
      if (updatedUser.credits !== undefined) {
        dataToStore.credits = updatedUser.credits.toString()
      }
      if (updatedUser.creditsResetDate) {
        dataToStore.creditsResetDate = updatedUser.creditsResetDate
      }
      if (updatedUser.subscriptionStartDate) {
        dataToStore.subscriptionStartDate = updatedUser.subscriptionStartDate
      }
      if (updatedUser.subscriptionEndDate) {
        dataToStore.subscriptionEndDate = updatedUser.subscriptionEndDate
      }

      await redis.hset(key, dataToStore)
      return
    } catch (error) {
      console.error('Redis update error:', error)
      throw error
    }
  }

  // Fallback to file storage
  await ensureDataFile()
  const raw = await fs.readFile(USERS_FILE, 'utf8')
  const json = JSON.parse(raw || '{"users":[]}') as { users: StoredUser[] }
  const userIndex = json.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase())
  if (userIndex >= 0) {
    json.users[userIndex] = { ...json.users[userIndex], ...updates }
    await fs.writeFile(USERS_FILE, JSON.stringify(json, null, 2), 'utf8')
  }
}


