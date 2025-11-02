import { getUserByEmail, updateUser } from './userStore'
import type { PlanType } from './userStore'

export interface CreditLimits {
  maxCredits: number
  resetPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none'
  wordLimit: number
  hasAdvancedDatabases: boolean
  hasChatAccess: boolean
}

/**
 * 获取用户计划的积分限制
 */
export function getPlanLimits(plan: PlanType): CreditLimits {
  switch (plan) {
    case 'free':
      return {
        maxCredits: 3,
        resetPeriod: 'daily',
        wordLimit: 300,
        hasAdvancedDatabases: false,
        hasChatAccess: false
      }
    case 'weekly':
      return {
        maxCredits: 35,
        resetPeriod: 'weekly',
        wordLimit: 1000,
        hasAdvancedDatabases: true,
        hasChatAccess: true
      }
    case 'monthly':
      return {
        maxCredits: 150,
        resetPeriod: 'monthly',
        wordLimit: 1000,
        hasAdvancedDatabases: true,
        hasChatAccess: true
      }
    case 'yearly':
      return {
        maxCredits: 3000,
        resetPeriod: 'yearly',
        wordLimit: 1000,
        hasAdvancedDatabases: true,
        hasChatAccess: true
      }
    default:
      return getPlanLimits('free')
  }
}

/**
 * 计算下一次积分重置日期
 */
export function calculateNextResetDate(plan: PlanType): Date {
  const now = new Date()
  const limits = getPlanLimits(plan)
  
  switch (limits.resetPeriod) {
    case 'daily':
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      return tomorrow
    case 'weekly':
      const nextWeek = new Date(now)
      const daysUntilNextMonday = (8 - now.getDay()) % 7 || 7
      nextWeek.setDate(now.getDate() + daysUntilNextMonday)
      nextWeek.setHours(0, 0, 0, 0)
      return nextWeek
    case 'monthly':
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      nextMonth.setDate(1)
      nextMonth.setHours(0, 0, 0, 0)
      return nextMonth
    case 'yearly':
      const nextYear = new Date(now)
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      nextYear.setMonth(0)
      nextYear.setDate(1)
      nextYear.setHours(0, 0, 0, 0)
      return nextYear
    default:
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 永远不重置
  }
}

/**
 * 检查并重置积分（如果需要）
 */
export async function checkAndResetCredits(email: string): Promise<number> {
  const user = await getUserByEmail(email)
  if (!user) return 0

  const limits = getPlanLimits(user.plan)
  
  // 如果是年费计划，不重置
  if (limits.resetPeriod === 'yearly' || limits.resetPeriod === 'none') {
    return user.credits !== undefined && user.credits !== null ? user.credits : limits.maxCredits
  }

  const now = new Date()
  const resetDate = user.creditsResetDate ? new Date(user.creditsResetDate) : null

  // 如果重置日期已过，重置积分
  if (!resetDate || resetDate <= now) {
    const nextReset = calculateNextResetDate(user.plan)
    await updateUser(email, {
      credits: limits.maxCredits,
      creditsResetDate: nextReset.toISOString()
    })
    return limits.maxCredits
  }

  // 确保用户有积分字段（兼容旧数据）
  if (user.credits === undefined || user.credits === null) {
    await updateUser(email, {
      credits: limits.maxCredits,
      creditsResetDate: resetDate.toISOString()
    })
    return limits.maxCredits
  }

  return user.credits
}

/**
 * 消耗积分
 */
export async function consumeCredit(email: string): Promise<{ success: boolean; creditsRemaining: number; error?: string }> {
  const user = await getUserByEmail(email)
  if (!user) {
    return { success: false, creditsRemaining: 0, error: 'User not found' }
  }

  // 先检查并重置积分
  const currentCredits = await checkAndResetCredits(email)
  
  if (currentCredits <= 0) {
    return { 
      success: false, 
      creditsRemaining: 0, 
      error: 'Insufficient credits. Please upgrade or wait for credits to reset.' 
    }
  }

  // 消耗1积分
  const newCredits = currentCredits - 1
  await updateUser(email, { credits: newCredits })

  return { success: true, creditsRemaining: newCredits }
}

/**
 * 检查字数限制
 */
export function checkWordLimit(plan: PlanType, textLength: number): { valid: boolean; error?: string } {
  const limits = getPlanLimits(plan)
  if (textLength > limits.wordLimit) {
    return {
      valid: false,
      error: `Text exceeds limit of ${limits.wordLimit} characters for ${plan} plan. Current: ${textLength} characters.`
    }
  }
  return { valid: true }
}

