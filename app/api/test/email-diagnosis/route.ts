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
      ? process.env.BREVO_API_KEY.substring(0, 20) + '...' 
      : 'NOT SET'
    const fromEmail = process.env.BREVO_FROM_EMAIL || 'lihongyangnju@gmail.com'
    const vercelEnv = process.env.VERCEL_ENV || 'unknown'
    const nodeEnv = process.env.NODE_ENV || 'unknown'
    const isProduction = vercelEnv === 'production' || process.env.VERCEL === '1'
    
    console.log('[Email Diagnosis] 诊断请求:', {
      testEmail,
      hasBrevoKey,
      brevoKeyPrefix,
      vercelEnv,
      nodeEnv,
      isProduction,
      timestamp: new Date().toISOString()
    })
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: {
        vercelEnv,
        nodeEnv,
        isProduction,
        hasBrevoKey,
        brevoKeyPrefix,
        fromEmail,
        brevoKeyFormat: process.env.BREVO_API_KEY?.startsWith('xkeysib-') ? '✅ 正确' : process.env.BREVO_API_KEY ? '❌ 可能不正确（应该以 xkeysib- 开头）' : '❌ 未配置',
        brevoKeyLength: process.env.BREVO_API_KEY?.length || 0
      },
      testEmail,
      testCode,
      testName
    }
    
    // 如果提供了测试邮箱，尝试发送测试邮件
    if (testEmail && testEmail !== 'test@example.com') {
      console.log('[Email Diagnosis] 📧 发送测试邮件到:', testEmail)
      const result = await sendVerificationEmail(testEmail, testCode, testName)
      
      console.log('[Email Diagnosis] 邮件发送结果:', {
        success: result.success,
        error: result.error,
        messageId: (result as any)?.messageId,
        statusCode: (result as any)?.statusCode
      })
      
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
        recommendations: getRecommendations(result, hasBrevoKey),
        nextSteps: getNextSteps(result, hasBrevoKey)
      })
    }
    
    return NextResponse.json({
      ...diagnosis,
      message: '提供 email 参数可以测试邮件发送',
      example: 'https://citea.cc/api/test/email-diagnosis?email=your-email@example.com',
      recommendations: getRecommendations(null, hasBrevoKey),
      nextSteps: getNextSteps(null, hasBrevoKey)
    })
  } catch (error: any) {
    console.error('[Email Diagnosis] ❌ 错误:', error)
    return NextResponse.json({
      error: '诊断失败',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
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

function getNextSteps(result: any, hasBrevoKey: boolean): string[] {
  const steps: string[] = []
  
  if (!hasBrevoKey) {
    steps.push('1. 访问 https://app.brevo.com/settings/keys/api 生成 API Key')
    steps.push('2. 在 Vercel 项目设置中添加环境变量 BREVO_API_KEY')
    steps.push('3. 确保环境变量已应用到 Production 环境')
    steps.push('4. 重新部署应用')
    steps.push('5. 再次测试邮件发送')
  } else if (result && !result.success) {
    if (result.error?.includes('无效或已过期')) {
      steps.push('1. 在 Brevo 控制台生成新的 API Key')
      steps.push('2. 更新 Vercel 环境变量 BREVO_API_KEY')
      steps.push('3. 重新部署应用')
    } else if (result.error?.includes('配额')) {
      steps.push('1. 等待明天重置配额（免费账户每日 300 封）')
      steps.push('2. 或升级到 Brevo 付费计划')
    } else if (result.error?.includes('访问被拒绝')) {
      steps.push('1. 检查 API Key 权限设置')
      steps.push('2. 在 Brevo 控制台验证发件邮箱')
      steps.push('3. 如果使用自定义域名，验证域名')
    } else {
      steps.push('1. 查看 Vercel Dashboard 中的 Functions 日志')
      steps.push('2. 查找 [Email] 和 [Signup] 相关日志')
      steps.push('3. 检查 Brevo 控制台的发送日志')
      steps.push('4. 根据具体错误信息修复问题')
    }
  } else if (result && result.success) {
    steps.push('1. 检查邮箱收件箱')
    steps.push('2. 检查垃圾邮件文件夹')
    steps.push('3. 检查邮箱过滤器')
    steps.push('4. 等待几分钟（邮件可能有延迟）')
    steps.push('5. 检查 Brevo 控制台的发送日志确认邮件已发送')
  }
  
  return steps
}

