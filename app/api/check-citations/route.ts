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
async function searchCitation(parsed: any) {
  if (!parsed || !parsed.title) return null

  try {
    // Search CrossRef with timeout
    const query = `${parsed.title || ''} ${parsed.authors || ''} ${parsed.year || ''}`
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
      }
    }
  } catch (error: any) {
    console.error('CrossRef error:', error.message)
  }

  // Try Semantic Scholar as backup
  try {
    const query = parsed.title || ''
    const response = await axios.get(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=title,authors,year,externalIds&limit=1`,
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
      }
    }
  } catch (error: any) {
    console.error('Semantic Scholar error:', error.message)
  }

  return null
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

    return {
      id,
      text: citation,
      verified: titleSim > 30 || authorsSim > 50,
      titleSimilarity: titleSim,
      authorsSimilarity: authorsSim,
      dateSimilarity: dateSim,
      bestMatch: {
        title: match.title,
        authors: match.authors,
        date: match.year,
        link: match.link,
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

    // 消耗积分
    const creditResult = await consumeCredit(user.email)
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || 'Insufficient credits' },
        { status: 403 }
      )
    }

    // Extract citations
    const citations = extractCitations(text)
    
    if (citations.length === 0) {
      return NextResponse.json({ 
        error: 'No citations found in the text',
        citations: [],
        totalFound: 0,
        verified: 0
      })
    }

    // Limit to first 10 citations to prevent timeout
    const limitedCitations = citations.slice(0, 10)

    // Verify each citation with delay
    const results: Citation[] = []
    for (const citation of limitedCitations) {
      try {
        const result = await verifyCitation(citation)
        results.push(result)
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

    const verifiedCount = results.filter(r => r.verified).length
    const verificationRate = Math.round((verifiedCount / results.length) * 100)

    return NextResponse.json({
      citations: results,
      totalFound: results.length,
      verified: verifiedCount,
      verificationRate,
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
