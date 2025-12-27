import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'
import { getUserByEmail } from '@/lib/userStore'
import { consumeCredit, getPlanLimits } from '@/lib/credits'

const TONGYI_API_KEY = process.env.TONGYI_API_KEY || ''

// 获取当前用户
async function getCurrentUser(request: NextRequest) {
  // 从 cookie 获取 token
  const cookieStore = cookies()
  let token = cookieStore.get('citea_auth')?.value

  // 从 Authorization header 获取（备用）
  if (!token) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) return null

  const jwtUser = await verifyJwt(token)
  if (!jwtUser) return null

  const fullUser = await getUserByEmail(jwtUser.email)
  return fullUser
}

export async function POST(request: NextRequest) {
  try {
    const { messages, language } = await request.json()
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    // 验证用户并检查权限
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 检查权限
    const limits = getPlanLimits(user.plan)
    if (!limits.hasChatAccess) {
      return NextResponse.json(
        { error: 'Chat feature is not available for your plan. Please upgrade to access this feature.' },
        { status: 403 }
      )
    }

    // 消耗积分（在验证权限后）
    const creditResult = await consumeCredit(user.email)
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || 'Insufficient credits' },
        { status: 403 }
      )
    }

    // 根据语言设置系统提示（支持 zh/Chinese/en/English 等值）
    const lang = typeof language === 'string' ? language.toLowerCase() : 'en'
    const isZh = lang === 'zh' || lang === 'zh-cn' || lang === 'chinese'
    const systemPrompt = isZh 
      ? `你是 Citea 的 AI 研究助手，Citea 是一个引用验证和文献查找工具。

你的专业领域包括：
- 帮助研究者验证引用和检查虚假参考文献
- 从 CrossRef、PubMed、arXiv 和 Semantic Scholar 等数据库查找可信的学术来源
- 解释引用格式（APA、MLA、Chicago 等）
- 提供学术诚信和研究最佳实践指导
- 检测可能伪造或 AI 生成的引用

请始终用中文回答，保持专业、准确和友好。直接回答用户的问题，不要主动强调价格或免费信息。`
      : `You are a helpful AI research assistant for Citea, a citation verification and source finding tool. 
              
Your expertise includes:
- Helping researchers verify citations and check for fake references
- Finding credible academic sources from databases like CrossRef, PubMed, arXiv, and Semantic Scholar
- Explaining citation formats (APA, MLA, Chicago, etc.)
- Providing guidance on academic integrity and research best practices
- Detecting potentially fabricated or AI-generated citations

Always respond in English, be helpful, accurate, and professional. Answer users' questions directly without proactively emphasizing pricing or free information.`

    let aiResponse: string
    try {
      // 手动超时处理
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      })
      
      // Call Tongyi Qianwen API with timeout
      const response = await Promise.race([
        fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TONGYI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'qwen-turbo',
            input: {
              messages: [
                {
                  role: 'system',
                  content: systemPrompt
                },
                ...messages
              ]
            },
            parameters: {
              max_tokens: 1000,
              temperature: 0.7,
              result_format: 'message'
            }
          })
        }),
        timeoutPromise
      ]) as Response

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Tongyi API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      // Extract response from Tongyi API
      aiResponse = data.output?.choices?.[0]?.message?.content || 
                   data.output?.text || 
                   'I apologize, but I encountered an error. Please try again.'
      
      if (!aiResponse || aiResponse.trim().length === 0) {
        throw new Error('Empty response from AI API')
      }
    } catch (apiError) {
      // API 调用失败，尝试退回积分
      console.error('[Chat] API call failed, attempting to refund credit:', apiError)
      try {
        const { updateUser } = await import('@/lib/userStore')
        const currentUser = await getUserByEmail(user.email)
        if (currentUser) {
          await updateUser(user.email, {
            credits: (currentUser.credits || 0) + 1
          })
        }
      } catch (refundError) {
        console.error('[Chat] Failed to refund credit:', refundError)
      }
      
      throw apiError
    }

    return NextResponse.json({ 
      response: aiResponse,
      model: 'qwen-turbo',
      creditsRemaining: creditResult.creditsRemaining
    })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ 
      response: 'I apologize, but I encountered an error processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

