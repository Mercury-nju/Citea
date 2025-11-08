import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { signJwt, setAuthCookie } from '@/lib/auth'
import { createUser, getUserByEmail, updateUserVerification } from '@/lib/userStore'
import { sendVerificationEmail } from '@/lib/email'

// 生成 6 位验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const existing = await getUserByEmail(String(email))
    
    // 如果用户已存在
    if (existing) {
      // 如果用户已验证，不允许重复注册
      if (existing.emailVerified) {
        return NextResponse.json({ 
          error: 'Email already registered',
          message: '该邮箱已注册并已验证。请直接登录。',
          verified: true
        }, { status: 409 })
      }
      
      // 如果用户未验证，允许重新注册（更新用户信息和验证码）
      console.log(`[Signup] User ${email} exists but not verified. Allowing re-registration.`)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    
    // 生成验证码
    const verificationCode = generateVerificationCode()
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 分钟后过期
    
    // 初始化免费用户的积分
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    // 如果用户已存在但未验证，保留原有的 ID 和创建时间
    const userId = existing && !existing.emailVerified ? existing.id : randomUUID()
    const createdAt = existing && !existing.emailVerified ? existing.createdAt : new Date().toISOString()
    
    // 确定用户的计划类型
    let userPlan: 'free' | 'weekly' | 'monthly' | 'yearly' = 'free'
    if (existing && !existing.emailVerified) {
      userPlan = existing.plan || 'free'
    }
    
    const user = { 
      id: userId, 
      name, 
      email, 
      passwordHash, 
      plan: userPlan,
      credits: existing && !existing.emailVerified ? existing.credits : 3, // 免费用户每天3积分，重新注册时保留原有积分
      creditsResetDate: tomorrow.toISOString(),
      createdAt,
      lastLoginAt: new Date().toISOString(),
      emailVerified: false,
      verificationCode,
      verificationExpiry
    }
    
    // 保存用户（如果已存在未验证用户，会更新用户信息）
    await createUser(user)
    
    // 如果是重新注册，记录日志
    if (existing && !existing.emailVerified) {
      console.log(`[Signup] Updated unverified user ${email} with new password and verification code`)
    }
    
    // 临时方案：如果设置了环境变量，跳过邮件验证（用于紧急修复）
    const skipEmailVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true'
    
    if (skipEmailVerification) {
      console.warn('[Signup] 跳过邮件验证（SKIP_EMAIL_VERIFICATION=true）')
      // 直接标记为已验证
      const Redis = require('ioredis')
      if (process.env.REDIS_URL && (process.env.REDIS_URL.startsWith('redis://') || process.env.REDIS_URL.startsWith('rediss://'))) {
        try {
          const redis = new Redis(process.env.REDIS_URL)
          await redis.hset(`user:${email.toLowerCase()}`, {
            emailVerified: 'true',
            verificationCode: '',
            verificationExpiry: ''
          })
          await redis.quit()
        } catch (err) {
          console.error('Redis update failed:', err)
        }
      }
      if (process.env.KV_REST_API_URL) {
        try {
          const kv = require('@vercel/kv')
          await kv.hset(`user:${email.toLowerCase()}`, {
            emailVerified: true,
            verificationCode: '',
            verificationExpiry: ''
          })
        } catch (err) {
          console.error('KV update failed:', err)
        }
      }
      // 自动登录
      const token = await signJwt({ id: user.id, email: user.email, name: user.name, plan: user.plan })
      setAuthCookie(token)
      return NextResponse.json({ 
        user: { id: user.id, name: user.name, email: user.email, plan: user.plan, emailVerified: true },
        message: '注册成功！',
        token,
        autoVerified: true
      }, { status: 201 })
    }
    
    // 发送验证邮件
    console.log('[Signup] 📧 准备发送验证邮件:', {
      email,
      name,
      hasCode: !!verificationCode,
      codeLength: verificationCode.length,
      hasBrevoKey: !!process.env.BREVO_API_KEY,
      brevoKeyPrefix: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 15) + '...' : 'NOT SET',
      fromEmail: process.env.BREVO_FROM_EMAIL || 'lihongyangnju@gmail.com'
    })
    
    const emailResult = await sendVerificationEmail(email, verificationCode, name)
    
    console.log('[Signup] 邮件发送结果:', {
      success: emailResult.success,
      error: emailResult.error,
      messageId: (emailResult as any)?.messageId,
      statusCode: (emailResult as any)?.statusCode,
      hasDetails: !!(emailResult as any)?.details
    })
    
    if (!emailResult.success) {
      console.error('[Signup] ❌ 验证邮件发送失败!', {
        error: emailResult.error,
        details: (emailResult as any)?.details,
        statusCode: (emailResult as any)?.statusCode,
        email,
        timestamp: new Date().toISOString()
      })
      
      // 检查是否是邮件服务未配置
      if (emailResult.error === 'Email service not configured' || emailResult.error?.includes('BREVO_API_KEY 未配置') || !process.env.BREVO_API_KEY) {
        console.error('[Signup] ⚠️ BREVO_API_KEY 未配置!')
        console.error('[Signup] 请在 Vercel 环境变量中配置 BREVO_API_KEY')
        
        // 生产环境：不返回验证码，要求配置邮件服务
        // 开发/预览环境：可以返回验证码以便测试
        const isDevelopment = process.env.NODE_ENV === 'development'
        const isVercelPreview = process.env.VERCEL_ENV === 'preview'
        const expose = process.env.EXPOSE_VERIFICATION_CODE === 'true'
        const shouldExposeCode = (isDevelopment || isVercelPreview || expose) && process.env.VERCEL_ENV !== 'production'
        
        return NextResponse.json({ 
          error: '邮件服务未配置',
          message: '验证码邮件发送失败：邮件服务未正确配置。请联系管理员或稍后重试。',
          details: 'BREVO_API_KEY 未配置。请在 Vercel 环境变量中配置 BREVO_API_KEY。',
          troubleshooting: '1. 检查 Vercel 环境变量中是否有 BREVO_API_KEY\n2. 确认 BREVO_API_KEY 格式正确（应以 xkeysib- 开头）\n3. 确认 API Key 在 Brevo 控制台中有效',
          // 只在开发/预览环境返回验证码
          verificationCode: shouldExposeCode ? verificationCode : undefined
        }, { status: 500 })
      }
      
      // 其他邮件发送错误，返回详细的错误信息
      const isDevelopment = process.env.NODE_ENV === 'development'
      const isVercelPreview = process.env.VERCEL_ENV === 'preview'
      const expose = process.env.EXPOSE_VERIFICATION_CODE === 'true'
      const shouldExposeCode = (isDevelopment || isVercelPreview || expose) && process.env.VERCEL_ENV !== 'production'
      
      // 根据错误类型提供不同的处理建议
      let troubleshooting = '请检查 Vercel 日志获取更多详细信息'
      if (emailResult.error?.includes('无效或已过期')) {
        troubleshooting = '1. 检查 BREVO_API_KEY 是否正确\n2. 在 Brevo 控制台生成新的 API Key\n3. 更新 Vercel 环境变量'
      } else if (emailResult.error?.includes('配额')) {
        troubleshooting = '1. Brevo 免费账户每日限制 300 封邮件\n2. 等待明天重置或升级到付费计划'
      } else if (emailResult.error?.includes('访问被拒绝')) {
        troubleshooting = '1. 检查 API Key 权限\n2. 确认发件邮箱已在 Brevo 中验证\n3. 检查发件邮箱域名是否已验证'
      }
      
      console.error('[Signup] 邮件发送失败，但不阻止注册。用户可以使用"重新发送验证码"功能。')
      
      return NextResponse.json({ 
        error: '验证码发送失败',
        message: `验证码邮件发送失败：${emailResult.error || '未知错误'}。您可以稍后使用"重新发送验证码"功能。`,
        details: (emailResult as any)?.details || emailResult.error,
        statusCode: (emailResult as any)?.statusCode,
        troubleshooting,
        // 只在开发/预览环境返回验证码
        verificationCode: shouldExposeCode ? verificationCode : undefined,
        // 即使邮件发送失败，也允许用户继续（可以稍后重新发送）
        needsVerification: true
      }, { status: 201 }) // 改为 201，允许用户继续注册流程
    }

    console.log('[Signup] ✅ 验证邮件发送成功!', {
      email,
      messageId: (emailResult.data as any)?.messageId || (emailResult as any)?.messageId || 'sent',
      to: email,
      sentAt: (emailResult as any)?.sentAt || new Date().toISOString(),
      timestamp: new Date().toISOString()
    })
    
    // 额外验证：确认 messageId 存在
    if (!(emailResult.data as any)?.messageId && !(emailResult as any)?.messageId) {
      console.warn('[Signup] ⚠️ 警告：邮件发送成功，但没有返回 messageId。这可能表示邮件实际上没有发送。')
    }

    // 不自动登录，需要验证邮箱后才能登录
    // 只在开发环境或明确设置时才返回验证码
    // 注意：生产环境不应该返回验证码，这会导致安全风险
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isVercelPreview = process.env.VERCEL_ENV === 'preview' // Vercel 预览环境
    const expose = process.env.EXPOSE_VERIFICATION_CODE === 'true'
    
    // 只有在开发环境、预览环境或明确设置时才返回验证码
    // 生产环境（production）永远不返回验证码
    const shouldExposeCode = (isDevelopment || isVercelPreview || expose) && process.env.VERCEL_ENV !== 'production'
    
    // 如果是重新注册，返回不同的消息
    const isReregistration = existing && !existing.emailVerified
    const message = isReregistration 
      ? '注册信息已更新！新的验证码已发送到您的邮箱，请查收并验证。'
      : '注册成功！验证码已发送到您的邮箱，请查收并验证。'
    
    console.log('[Signup] Registration successful:', {
      email,
      messageSent: true,
      exposeCode: shouldExposeCode,
      isDevelopment,
      isVercelPreview,
      vercelEnv: process.env.VERCEL_ENV,
      nodeEnv: process.env.NODE_ENV
    })
    
    return NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      needsVerification: true,
      message,
      reregistered: isReregistration, // 标记是否为重新注册
      // 生产环境不返回验证码，必须通过邮箱获取
      verificationCode: shouldExposeCode ? verificationCode : undefined
    }, { status: 201 })
  } catch (e: any) {
    console.error('Signup error:', e)
    console.error('Error stack:', e?.stack)
    
    // 提供更详细的错误信息
    const errorMessage = e?.message || 'Internal error'
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // 如果是数据库配置问题，给出明确提示
    if (errorMessage.includes('Database not configured') || errorMessage.includes('KV_REST_API_URL')) {
      return NextResponse.json({ 
        error: 'Database not configured',
        message: 'Please configure Vercel KV or REDIS_URL in environment variables.',
        details: isDevelopment ? errorMessage : undefined
      }, { status: 500 })
    }
    
    // Redis 连接错误
    if (errorMessage.includes('Redis') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to database. Please check REDIS_URL configuration.',
        details: isDevelopment ? errorMessage : undefined
      }, { status: 500 })
    }
    
    // 在生产环境也返回一些有用的错误信息
    return NextResponse.json({ 
      error: 'Internal error', 
      message: errorMessage || 'An unexpected error occurred. Please try again later.',
      details: process.env.VERCEL_ENV !== 'production' ? (errorMessage + '\n' + e?.stack) : undefined
    }, { status: 500 })
  }
}


