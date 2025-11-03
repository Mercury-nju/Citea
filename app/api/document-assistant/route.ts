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

    // 文档助手对所有登录用户开放（只检查积分，不限制套餐）

    const creditResult = await consumeCredit(user.email)
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error || 'Insufficient credits' }, { status: 403 })
    }

    const systemPrompt = language === 'zh' ? `你是 Citea 的“学术论文生成助手”。你的目标是基于用户意图，循序渐进生成可发表水准的学术文本（背景、相关工作、方法、实验、结论、摘要、引言等），并在需要时提供改写建议。
写作要求：
- 学术风格，措辞克制、客观、明确；避免营销语气。
- 结构清晰、段落连贯，首句点题、末句承接；术语一致。
- 不捏造数据与来源；如需引用，用占位符 [ref] 表示，不生成虚假参考文献。
- 输出默认使用中文（若 language=zh）。长度遵循用户要求；若未指定长度，请生成充分且专业的章节级内容，不做固定字数或段落限制。
建议模式（suggest）要求：输出严格 JSON（见后文格式），只给可独立应用的小修改。
` : `You are Citea's Academic Paper Writer. Your goal is to iteratively produce publication-grade academic text (background, related work, method, experiments, conclusion, abstract, introduction, etc.) from user intents, and provide concise edit suggestions when asked.
Style:
- Academic tone, objective and precise. No marketing language.
- Clear structure and cohesion; topic sentence first, concluding sentence to connect; consistent terminology.
- Do NOT fabricate data or sources. If references are needed, use placeholders like [ref]; do not invent bibliography.
- Follow user length instructions. If unspecified, produce substantial, section-level content with no fixed word/paragraph limit.
For "suggest", return strict JSON with small, independently applicable edits.
`

    const userInstruction = operation === 'generate'
      ? (language === 'zh'
          ? `请根据以下主题或提纲，生成1-2段学术风格的文本：\n${instructions || inputText || ''}`
          : `Based on the topic or outline below, generate 1-2 paragraphs in an academic style:\n${instructions || inputText || ''}`)
      : (language === 'zh'
          ? `请基于以下文本输出严格的 JSON 对象：{ "suggestions": Suggestion[], "feedback": {"grammar": string, "logic": string, "clarity": string, "overall": string} }。\nSuggestion 元素字段：{ "type": "replace"|"add"|"delete", "target"?: string, "position"?: string, "text": string }。\n- replace: 用 text 替换 target；add: 在 target 之后或 position 指定处插入 text（若无 target/position 则追加到文末）；delete: 删除 target。\n请勿输出任何解释性文字，仅输出 JSON。\n待分析文本：\n${inputText || ''}`
          : `Return a strict JSON object: { "suggestions": Suggestion[], "feedback": {"grammar": string, "logic": string, "clarity": string, "overall": string} }.\nSuggestion: { "type": "replace"|"add"|"delete", "target"?: string, "position"?: string, "text": string }.\n- replace: replace target with text; add: insert text after target or at position (append to end if neither); delete: remove target.\nDo NOT include any prose outside JSON.\nText to review:\n${inputText || ''}`)

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


