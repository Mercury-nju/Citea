import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'

/**
 * 邮件发送诊断 API
 * 用于测试和诊断邮件发送问题
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email') || 'test@example.com'
    const testCode = '123456'
    const testName = 'Test User'
    
    // 检查环境变量
    const hasBrevoKey = !!process.env.BREVO_API_KEY
    const brevoKeyPrefix = process.env.BREVO_API_KEY 
      ? process.env.BREVO_API_KEY.substring(0, 15) + '...' 
      : 'NOT SET'
    const fromEmail = process.env.BREVO_FROM_EMAIL || 'lihongyangnju@gmail.com'
    const vercelEnv = process.env.VERCEL_ENV || 'unknown'
    const nodeEnv = process.env.NODE_ENV || 'unknown'
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: {
        vercelEnv,
        nodeEnv,
        hasBrevoKey,
        brevoKeyPrefix,
        fromEmail,
        brevoKeyFormat: process.env.BREVO_API_KEY?.startsWith('xkeysib-') ? '✅ 正确' : '❌ 可能不正确'
      },
      testEmail,
      testCode,
      testName
    }
    
    // 如果提供了测试邮箱，尝试发送测试邮件
    if (testEmail && testEmail !== 'test@example.com') {
      console.log('[Email Diagnosis] 发送测试邮件到:', testEmail)
      const result = await sendVerificationEmail(testEmail, testCode, testName)
      
      return NextResponse.json({
        ...diagnosis,
        testResult: {
          success: result.success,
          error: result.error,
          messageId: (result as any)?.messageId,
          statusCode: (result as any)?.statusCode,
          details: (result as any)?.details,
          sentAt: (result as any)?.sentAt
        },
        recommendations: getRecommendations(result, hasBrevoKey)
      })
    }
    
    return NextResponse.json({
      ...diagnosis,
      message: '提供 email 参数可以测试邮件发送',
      recommendations: getRecommendations(null, hasBrevoKey)
    })
  } catch (error: any) {
    console.error('[Email Diagnosis] 错误:', error)
    return NextResponse.json({
      error: '诊断失败',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

function getRecommendations(result: any, hasBrevoKey: boolean): string[] {
  const recommendations: string[] = []
  
  if (!hasBrevoKey) {
    recommendations.push('❌ BREVO_API_KEY 未配置。请在 Vercel 环境变量中配置。')
    recommendations.push('1. 访问 https://app.brevo.com/settings/keys/api')
    recommendations.push('2. 生成新的 API Key')
    recommendations.push('3. 在 Vercel 项目设置中添加环境变量 BREVO_API_KEY')
    return recommendations
  }
  
  if (result) {
    if (!result.success) {
      if (result.error?.includes('无效或已过期')) {
        recommendations.push('❌ BREVO_API_KEY 无效或已过期')
        recommendations.push('1. 在 Brevo 控制台生成新的 API Key')
        recommendations.push('2. 更新 Vercel 环境变量 BREVO_API_KEY')
        recommendations.push('3. 重新部署应用')
      } else if (result.error?.includes('配额')) {
        recommendations.push('❌ Brevo 配额已用完')
        recommendations.push('1. 免费账户每日限制 300 封邮件')
        recommendations.push('2. 等待明天重置或升级到付费计划')
      } else if (result.error?.includes('访问被拒绝')) {
        recommendations.push('❌ API 访问被拒绝')
        recommendations.push('1. 检查 API Key 权限')
        recommendations.push('2. 确认发件邮箱已在 Brevo 中验证')
        recommendations.push('3. 检查发件邮箱域名是否已验证')
      } else {
        recommendations.push('❌ 邮件发送失败')
        recommendations.push('1. 检查 Vercel 日志获取详细错误信息')
        recommendations.push('2. 确认 Brevo 账户状态正常')
        recommendations.push('3. 检查发件邮箱格式和验证状态')
      }
    } else {
      recommendations.push('✅ 邮件发送成功！')
      recommendations.push('如果用户仍然没有收到邮件：')
      recommendations.push('1. 检查垃圾邮件文件夹')
      recommendations.push('2. 检查邮箱过滤器')
      recommendations.push('3. 等待几分钟（邮件可能有延迟）')
      recommendations.push('4. 检查 Brevo 控制台的发送日志')
    }
  }
  
  return recommendations
}

