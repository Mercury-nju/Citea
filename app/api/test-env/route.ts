import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 检查环境变量
    const hasRedis = !!process.env.REDIS_URL
    const hasKV = !!process.env.KV_REST_API_URL
    const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    const hasTongyiKey = !!process.env.TONGYI_API_KEY
    
    // 检查 Redis URL 格式
    let redisUrlType = 'NOT SET'
    if (process.env.REDIS_URL) {
      if (process.env.REDIS_URL.startsWith('redis://')) {
        redisUrlType = 'redis:// (standard)'
      } else if (process.env.REDIS_URL.startsWith('rediss://')) {
        redisUrlType = 'rediss:// (SSL)'
      } else if (process.env.REDIS_URL.startsWith('https://')) {
        redisUrlType = 'https:// (REST API - NOT SUPPORTED)'
      } else {
        redisUrlType = 'UNKNOWN FORMAT'
      }
    }
    
    // 测试 Redis 连接
    let redisConnectionTest = 'NOT TESTED'
    if (hasRedis && (process.env.REDIS_URL?.startsWith('redis://') || process.env.REDIS_URL?.startsWith('rediss://'))) {
      try {
        const Redis = require('ioredis')
        const redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          connectTimeout: 5000
        })
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            redis.disconnect()
            reject(new Error('Connection timeout'))
          }, 5000)
          
          redis.once('connect', () => {
            clearTimeout(timeout)
            redis.disconnect()
            resolve(true)
          })
          
          redis.once('error', (err: Error) => {
            clearTimeout(timeout)
            redis.disconnect()
            reject(err)
          })
        })
        
        redisConnectionTest = '✅ SUCCESS'
      } catch (error: any) {
        redisConnectionTest = `❌ FAILED: ${error.message}`
      }
    }
    
    return NextResponse.json({
      environment: process.env.VERCEL_ENV || 'development',
      database: {
        hasRedis,
        redisUrlType,
        redisConnectionTest,
        hasKV,
      },
      email: {
        hasSupabase,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 未配置',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已配置' : '❌ 未配置',
      },
      ai: {
        hasTongyiKey,
        tongyiKeyPrefix: process.env.TONGYI_API_KEY ? process.env.TONGYI_API_KEY.substring(0, 10) + '...' : 'NOT SET',
      },
      diagnosis: getDiagnosis(hasRedis, hasKV, redisUrlType, redisConnectionTest),
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

function getDiagnosis(hasRedis: boolean, hasKV: boolean, redisUrlType: string, connectionTest: string): string {
  if (!hasRedis && !hasKV) {
    return '❌ NO DATABASE CONFIGURED - Please set REDIS_URL or configure Vercel KV'
  }
  
  if (hasRedis && redisUrlType.includes('REST API')) {
    return '❌ REDIS_URL is REST API format - Please use redis:// or rediss:// format instead'
  }
  
  if (hasRedis && connectionTest.includes('FAILED')) {
    return `❌ REDIS CONNECTION FAILED - ${connectionTest}`
  }
  
  if (hasRedis && connectionTest.includes('SUCCESS')) {
    return '✅ ALL GOOD - Database is configured and connected'
  }
  
  if (hasKV) {
    return '✅ Vercel KV is configured'
  }
  
  return '⚠️ UNKNOWN STATE - Please check configuration'
}
