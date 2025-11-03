import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'
import { getUserByEmail } from '@/lib/userStore'
import { consumeCredit, getPlanLimits } from '@/lib/credits'

const TONGYI_API_KEY = process.env.TONGYI_API_KEY || 'sk-9bf19547ddbd4be1a87a7a43cf251097'

async function getCurrentUser(request: NextRequest) {
  const cookieStore = cookies()
  let token = cookieStore.get('citea_auth')?.value
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
    const { operation, inputText, instructions, language } = await request.json()

    if (!operation || (operation !== 'generate' && operation !== 'suggest')) {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
    }

    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const limits = getPlanLimits(user.plan)
    if (!limits.hasChatAccess) {
      return NextResponse.json({ error: 'Document Assistant is only available for paid users.' }, { status: 403 })
    }

    const creditResult = await consumeCredit(user.email)
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error || 'Insufficient credits' }, { status: 403 })
    }

    const systemPrompt = language === 'zh' ? `你是 Citea 的学术写作助手，负责根据用户输入生成高质量学术段落，并在建议模式下提供修改建议（标注替换、增加、删除）。
写作风格：清晰、严谨、客观，避免夸张用语。
注意：
- 如为“generate”，请直接生成1-2段自然段文本。
- 如为“suggest”，请对给定文本逐段给出建议，输出包含三类建议：替换（replace）、增补（add）、删减（delete）。每条建议尽量短小并可单独应用。
- 关注语法、逻辑、清晰度、衔接、术语一致性。
` : `You are Citea's academic writing assistant. Based on user input, you either generate high-quality academic paragraphs or provide edit suggestions in suggestion mode (marking replace/add/delete).
Tone: clear, rigorous, objective; avoid hype.
Guidelines:
- If operation is "generate", produce 1-2 cohesive paragraphs.
- If operation is "suggest", provide per-paragraph suggestions of types: replace, add, delete. Keep each suggestion small and independently applicable.
- Focus on grammar, logic, clarity, flow, and terminology consistency.
`

    const userInstruction = operation === 'generate'
      ? (language === 'zh'
          ? `请根据以下主题或提纲，生成1-2段学术风格的文本：\n${instructions || inputText || ''}`
          : `Based on the topic or outline below, generate 1-2 paragraphs in an academic style:\n${instructions || inputText || ''}`)
      : (language === 'zh'
          ? `请基于以下文本提供逐段可应用的建议（JSON数组，元素包含type: 'replace'|'add'|'delete', target/position, suggestion文本或replacement）。文本：\n${inputText || ''}`
          : `Please provide per-paragraph, independently applicable suggestions (JSON array with items having type: 'replace'|'add'|'delete', target/position, and suggestion or replacement text). Text:\n${inputText || ''}`)

    // Construct messages for Tongyi
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInstruction }
    ]

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TONGYI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: { messages },
        parameters: { max_tokens: 1000, temperature: 0.5, result_format: 'message' }
      })
    })

    if (!response.ok) {
      throw new Error(`Tongyi API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.output?.choices?.[0]?.message?.content || data.output?.text || ''

    return NextResponse.json({ content, operation })
  } catch (error) {
    console.error('Error in document assistant:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}


