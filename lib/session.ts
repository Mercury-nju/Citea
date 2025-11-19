import { cookies } from 'next/headers'
import { verifyJwt, getAuthTokenFromCookies, type AuthUser } from './auth'

/**
 * 获取当前会话用户信息
 * 服务器端使用
 */
export async function getSession(): Promise<AuthUser | null> {
  const token = getAuthTokenFromCookies()
  if (!token) return null
  return await verifyJwt(token)
}

/**
 * 检查用户是否已登录
 * 服务器端使用
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getSession()
  return user !== null
}

/**
 * 要求用户必须登录
 * 如果未登录则返回错误响应
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * 检查用户是否有指定权限
 */
export async function hasPermission(requiredPlan: string): Promise<boolean> {
  const user = await getSession()
  if (!user) return false
  
  const planHierarchy = ['free', 'pro', 'enterprise']
  const userPlanIndex = planHierarchy.indexOf(user.plan || 'free')
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan)
  
  return userPlanIndex >= requiredPlanIndex
}

/**
 * 获取用户信息 (客户端使用)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include'
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

