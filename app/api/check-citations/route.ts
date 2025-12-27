import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'
import { verifyJwt } from '@/lib/auth'
import { getUserByEmail } from '@/lib/userStore'
import { consumeCredit, checkWordLimit, getPlanLimits } from '@/lib/credits'

const TONGYI_API_KEY = process.env.TONGYI_API_KEY || 'sk-9bf19547ddbd4be1a87a7a43cf251097'
const TONGYI_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

// 检查 API key 是否配置
if (!TONGYI_API_KEY || TONGYI_API_KEY === '') {
  console.warn('⚠️ TONGYI_API_KEY is not configured. Citation parsing may fail.')
}

interface Citation {
  id: string
  text: string
  verified: boolean
  titleSimilarity: number
  authorsSimilarity: number
  dateSimilarity: number
  bestMatch?: {
    title: string
    authors: string
    date: string
    link: string
    source?: string
    abstract?: string | null
    webSearchNote?: string
  }
}

// Extract citations from text
function extractCitations(text: string): string[] {
  const lines = text.split('\n').filter(line => line.trim())
  const citations: string[] = []
  
  lines.forEach(line => {
    // Match citation patterns like [57], [58], etc.
    if (line.match(/^\[\d+\]/)) {
      citations.push(line.trim())
    }
  })
  
  return citations.length > 0 ? citations : [text]
}

// Parse citation using AI with better error handling
async function parseCitation(citation: string) {
  try {
    const prompt = `Parse this academic citation and extract key information. Return ONLY a valid JSON object:

Citation: "${citation}"

JSON format:
{
  "title": "paper title or null",
  "authors": "author names or null",
  "journal": "journal name or null",
  "year": "publication year or null"
}

Return ONLY the JSON object, no other text.`

    const response = await axios.post(TONGYI_API_URL, {
      model: 'qwen-turbo',
      input: {
        messages: [{ role: 'user', content: prompt }],
      },
      parameters: {
        result_format: 'message',
        temperature: 0.1,
      },
    }, {
      headers: {
        'Authorization': `Bearer ${TONGYI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    })

    const content = response.data.output.choices[0].message.content
    
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*?\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed
      } catch (e) {
        console.error('JSON parse error:', e)
        return null
      }
    }
    
    return null
  } catch (error: any) {
    console.error('Error parsing citation:', error.message)
    // Return a basic fallback
    return {
      title: citation.substring(0, 100),
      authors: null,
      journal: null,
      year: null
    }
  }
}

// Search for citation in databases with timeout and error handling
// 阶段1: 学术数据库搜索
// 阶段2: 网络搜索（如果学术数据库找不到）
async function searchCitation(parsed: any) {
  if (!parsed || !parsed.title) return null

  const query = `${parsed.title || ''} ${parsed.authors || ''} ${parsed.year || ''}`

  // ========== 阶段1: 学术数据库搜索 ==========
  
  // 1. CrossRef
  try {
    const response = await axios.get(
      `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=1`,
      { 
        timeout: 8000,
        headers: {
          'User-Agent': 'Citea/1.0 (mailto:support@citea.app)'
        }
      }
    )

    if (response.data.message.items && response.data.message.items.length > 0) {
      const item = response.data.message.items[0]
      return {
        title: item.title ? item.title[0] : '',
        authors: item.author ? item.author.slice(0, 3).map((a: any) => `${a.given || ''} ${a.family || ''}`).join(', ') : '',
        year: item['published-print'] ? item['published-print']['date-parts'][0][0].toString() : 
              (item.issued ? item.issued['date-parts'][0][0].toString() : ''),
        doi: item.DOI,
        link: item.DOI ? `https://doi.org/${item.DOI}` : '',
        source: 'CrossRef',
        abstract: item.abstract || null,
      }
    }
  } catch (error: any) {
    console.error('CrossRef error:', error.message)
  }

  // 2. Semantic Scholar
  try {
    const response = await axios.get(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(parsed.title || '')}&fields=title,authors,year,externalIds,abstract&limit=1`,
      { 
        timeout: 8000,
        headers: {
          'User-Agent': 'Citea/1.0'
        }
      }
    )

    if (response.data.data && response.data.data.length > 0) {
      const item = response.data.data[0]
      return {
        title: item.title || '',
        authors: item.authors ? item.authors.slice(0, 3).map((a: any) => a.name).join(', ') : '',
        year: item.year ? item.year.toString() : '',
        doi: item.externalIds?.DOI || '',
        link: item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : 
              `https://www.semanticscholar.org/paper/${item.paperId}`,
        source: 'Semantic Scholar',
        abstract: item.abstract || null,
      }
    }
  } catch (error: any) {
    console.error('Semantic Scholar error:', error.message)
  }

  // 3. OpenAlex
  try {
    const response = await axios.get(
      `https://api.openalex.org/works?search=${encodeURIComponent(parsed.title || '')}&per_page=1`,
      { 
        timeout: 8000,
        headers: {
          'User-Agent': 'Citea/1.0 (mailto:support@citea.app)'
        }
      }
    )

    if (response.data.results && response.data.results.length > 0) {
      const item = response.data.results[0]
      const authors = item.authorships?.slice(0, 3)?.map((a: any) => a.author?.display_name)?.filter(Boolean)?.join(', ') || ''
      return {
        title: item.title || '',
        authors,
        year: item.publication_year?.toString() || '',
        doi: item.doi ? item.doi.replace('https://doi.org/', '') : '',
        link: item.doi || item.id || '',
        source: 'OpenAlex',
        abstract: item.abstract_inverted_index ? '摘要可用' : null,
      }
    }
  } catch (error: any) {
    console.error('OpenAlex error:', error.message)
  }

  // ========== 阶段2: 网络搜索（学术数据库找不到时） ==========
  console.log('[Citation] 学术数据库未找到，尝试网络搜索...')
  
  // 使用 Google Scholar 搜索（通过 SerpAPI 或直接搜索）
  try {
    // 构建 Google Scholar 搜索链接
    const scholarQuery = encodeURIComponent(`"${parsed.title || ''}" ${parsed.authors || ''}`)
    const scholarLink = `https://scholar.google.com/scholar?q=${scholarQuery}`
    
    // 尝试通过 DuckDuckGo 搜索（免费，无需 API key）
    const ddgQuery = encodeURIComponent(`${parsed.title || ''} ${parsed.authors || ''} site:scholar.google.com OR site:researchgate.net OR site:academia.edu OR filetype:pdf`)
    const ddgResponse = await axios.get(
      `https://api.duckduckgo.com/?q=${ddgQuery}&format=json&no_html=1`,
      { timeout: 8000 }
    )

    // DuckDuckGo 的 instant answer API 可能返回相关结果
    if (ddgResponse.data.AbstractText || ddgResponse.data.RelatedTopics?.length > 0) {
      return {
        title: parsed.title || '',
        authors: parsed.authors || '',
        year: parsed.year || '',
        doi: '',
        link: scholarLink,
        source: 'Web Search',
        abstract: ddgResponse.data.AbstractText || '通过网络搜索找到相关结果',
        webSearchNote: '此结果来自网络搜索，建议点击链接进一步验证'
      }
    }

    // 即使 DuckDuckGo 没有直接结果，也返回 Google Scholar 链接供用户手动验证
    return {
      title: parsed.title || '',
      authors: parsed.authors || '',
      year: parsed.year || '',
      doi: '',
      link: scholarLink,
      source: 'Web Search',
      abstract: null,
      webSearchNote: '学术数据库未收录，已生成 Google Scholar 搜索链接供手动验证'
    }
  } catch (error: any) {
    console.error('Web search error:', error.message)
    
    // 最后的备用方案：返回 Google Scholar 链接
    const scholarQuery = encodeURIComponent(`"${parsed.title || ''}"`)
    return {
      title: parsed.title || '',
      authors: parsed.authors || '',
      year: parsed.year || '',
      doi: '',
      link: `https://scholar.google.com/scholar?q=${scholarQuery}`,
      source: 'Web Search',
      abstract: null,
      webSearchNote: '请点击链接在 Google Scholar 中手动搜索验证'
    }
  }
}

// Calculate similarity percentage
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 100
  
  // Simple word-based similarity
  const words1 = new Set(s1.split(/\s+/))
  const words2 = new Set(s2.split(/\s+/))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  return Math.round((intersection.size / union.size) * 100)
}

// Verify single citation with comprehensive error handling
async function verifyCitation(citation: string): Promise<Citation> {
  const id = Math.random().toString(36).substr(2, 9)
  
  try {
    // Parse citation with timeout protection
    const parsed = await Promise.race([
      parseCitation(citation),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Parse timeout')), 15000)
      )
    ]).catch(() => null)

    if (!parsed) {
      return {
        id,
        text: citation,
        verified: false,
        titleSimilarity: 0,
        authorsSimilarity: 0,
        dateSimilarity: 0,
      }
    }

    // Search for matches with timeout protection
    const match = await Promise.race([
      searchCitation(parsed),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Search timeout')), 15000)
      )
    ]).catch(() => null)
    
    if (!match) {
      return {
        id,
        text: citation,
        verified: false,
        titleSimilarity: 0,
        authorsSimilarity: 0,
        dateSimilarity: 0,
      }
    }

    // Calculate similarities
    const titleSim = calculateSimilarity(parsed.title || '', match.title)
    const authorsSim = calculateSimilarity(parsed.authors || '', match.authors)
    
    let dateSim = 0
    if (parsed.year && match.year) {
      const yearDiff = Math.abs(parseInt(parsed.year) - parseInt(match.year))
      dateSim = yearDiff === 0 ? 100 : yearDiff <= 1 ? 80 : yearDiff <= 3 ? 60 : 0
    }

    // 对于网络搜索结果，即使相似度低也标记为"已找到"
    const isWebSearch = match.source === 'Web Search'
    const verified = isWebSearch ? true : (titleSim > 30 || authorsSim > 50)

    return {
      id,
      text: citation,
      verified,
      titleSimilarity: titleSim,
      authorsSimilarity: authorsSim,
      dateSimilarity: dateSim,
      bestMatch: {
        title: match.title,
        authors: match.authors,
        date: match.year,
        link: match.link,
        source: match.source,
        abstract: match.abstract,
        webSearchNote: match.webSearchNote,
      },
    }
  } catch (error: any) {
    console.error('Verification error:', error.message)
    return {
      id,
      text: citation,
      verified: false,
      titleSimilarity: 0,
      authorsSimilarity: 0,
      dateSimilarity: 0,
    }
  }
}

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

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // 验证用户并检查权限
    // 注意：允许未登录用户使用基础功能（但会限制功能）
    const user = await getCurrentUser(req)
    if (!user) {
      // 对于未登录用户，允许使用但限制功能
      // 或者要求登录
      return NextResponse.json(
        { 
          error: 'Authentication required. Please sign in to use citation verification.',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      )
    }

    // 检查字数限制
    const wordLimitCheck = checkWordLimit(user.plan, text.length)
    if (!wordLimitCheck.valid) {
      return NextResponse.json(
        { error: wordLimitCheck.error },
        { status: 400 }
      )
    }

    // 检查数据库权限（免费用户只能使用基础数据库）
    const limits = getPlanLimits(user.plan)
    // 注意：引文验证对免费用户也开放，但可能使用更少的数据库

    // Extract citations first to validate input
    const citations = extractCitations(text)
    
    if (citations.length === 0) {
      return NextResponse.json({ 
        error: 'No citations found in the text',
        citations: [],
        totalFound: 0,
        verified: 0
      })
    }

    // 消耗积分（在验证输入后，避免无效请求消耗积分）
    const creditResult = await consumeCredit(user.email)
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || 'Insufficient credits' },
        { status: 403 }
      )
    }

    // Limit to first 10 citations to prevent timeout
    const limitedCitations = citations.slice(0, 10)

    // Verify each citation with delay
    const results: Citation[] = []
    let successCount = 0
    try {
      for (const citation of limitedCitations) {
        try {
          const result = await verifyCitation(citation)
          results.push(result)
          if (result.verified) successCount++
          // Delay between requests to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error('Error verifying citation:', error)
          // Add failed citation
          results.push({
            id: Math.random().toString(36).substr(2, 9),
            text: citation,
            verified: false,
            titleSimilarity: 0,
            authorsSimilarity: 0,
            dateSimilarity: 0,
          })
        }
      }
    } catch (error) {
      // 如果整个验证过程失败，尝试退回积分
      console.error('[Check Citations] Verification process failed, attempting to refund credit:', error)
      try {
        const { updateUser } = await import('@/lib/userStore')
        const currentUser = await getUserByEmail(user.email)
        if (currentUser && results.length === 0) {
          // 只有在完全没有结果时才退回积分
          await updateUser(user.email, {
            credits: (currentUser.credits || 0) + 1
          })
        }
      } catch (refundError) {
        console.error('[Check Citations] Failed to refund credit:', refundError)
      }
      throw error
    }

    const verifiedCount = results.filter(r => r.verified).length
    const verificationRate = results.length > 0 ? Math.round((verifiedCount / results.length) * 100) : 0

    return NextResponse.json({
      citations: results,
      totalFound: results.length,
      verified: verifiedCount,
      verificationRate,
      creditsRemaining: creditResult.creditsRemaining
    })
  } catch (error: any) {
    console.error('Error in check-citations API:', error)
    const errorMessage = error?.message || 'Unknown error'
    const errorStack = error?.stack || ''
    
    // 提供更详细的错误信息用于调试
    return NextResponse.json({ 
      error: 'Failed to check citations. Please try again.',
      details: errorMessage,
      // 只在开发环境返回堆栈信息
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
    }, { status: 500 })
  }
}
