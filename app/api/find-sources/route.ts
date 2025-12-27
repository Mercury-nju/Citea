import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'
import { getUserByEmail } from '@/lib/userStore'
import { consumeCredit, checkWordLimit, getPlanLimits } from '@/lib/credits'

const TONGYI_API_KEY = process.env.TONGYI_API_KEY || 'sk-9bf19547ddbd4be1a87a7a43cf251097'

interface SearchStrategy {
  keywords: string[]
  searchType: 'medical' | 'science' | 'technology' | 'social' | 'general'
  databases: string[]
  reasoning: string
}

interface Source {
  id: string
  title: string
  authors: string
  year: string
  journal: string
  doi: string | null
  source: string
  verified: boolean
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

// 支持流式响应，每个步骤实时返回
export async function POST(request: NextRequest) {
  try {
    const { text, step } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // 验证用户并检查权限
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
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

    // 如果是第一步，消耗积分
    let creditResult: { success: boolean; creditsRemaining: number; error?: string } | null = null
    if (step === 1) {
      creditResult = await consumeCredit(user.email)
      if (!creditResult.success) {
        return NextResponse.json(
          { error: creditResult.error || 'Insufficient credits' },
          { status: 403 }
        )
      }
    }

    // 如果指定了步骤，执行对应的步骤
    if (step !== undefined) {
      try {
        const result = await executeStep(step, text, user)
        // 如果成功，返回结果（包含积分信息）
        if (creditResult && result.status === 200) {
          const json = await result.json()
          return NextResponse.json({
            ...json,
            creditsRemaining: creditResult.creditsRemaining
          }, { status: 200 })
        }
        return result
      } catch (stepError) {
        // 步骤执行失败，尝试退回积分
        if (step === 1 && creditResult) {
          console.error('[Find Sources] Step execution failed, attempting to refund credit:', stepError)
          try {
            const { updateUser } = await import('@/lib/userStore')
            const currentUser = await getUserByEmail(user.email)
            if (currentUser) {
              await updateUser(user.email, {
                credits: (currentUser.credits || 0) + 1
              })
            }
          } catch (refundError) {
            console.error('[Find Sources] Failed to refund credit:', refundError)
          }
        }
        throw stepError
      }
    }

      // 如果没有指定步骤，返回完整流程（兼容旧代码）
      const limits = getPlanLimits(user.plan)
      const strategy = await analyzeUserIntent(text)
      const sources = await intelligentSearch(strategy, limits.hasAdvancedDatabases)

      return NextResponse.json({
        success: true,
        strategy,
        sources,
        totalFound: sources.length
      })
  } catch (error: any) {
    console.error('Error in find-sources:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to find sources' },
      { status: 500 }
    )
  }
}

/**
 * 执行特定步骤
 */
async function executeStep(step: number, text: string, user: any): Promise<NextResponse> {
  const limits = getPlanLimits(user.plan)
  
  switch (step) {
    case 1:
      // Step 1: 智能分析用户意图，确定搜索策略
      const strategy = await analyzeUserIntent(text)
      return NextResponse.json({
        step: 1,
        status: 'completed',
        strategy
      })

    case 2:
      // Step 2: 搜索 CrossRef 数据库（所有用户可用）
      const strategy2 = await analyzeUserIntent(text)
      const crossRefResults = await searchCrossRef(strategy2.keywords)
      return NextResponse.json({
        step: 2,
        status: 'completed',
        sources: crossRefResults,
        database: 'CrossRef'
      })

    case 3:
      // Step 3: 搜索 PubMed 数据库（仅付费用户可用）
      const strategy3 = await analyzeUserIntent(text)
      let pubmedResults: Source[] = []
      if (limits.hasAdvancedDatabases && (strategy3.searchType === 'medical' || strategy3.databases.includes('PubMed'))) {
        pubmedResults = await searchPubMed(strategy3.keywords)
      }
      return NextResponse.json({
        step: 3,
        status: 'completed',
        sources: pubmedResults,
        database: 'PubMed'
      })

    case 4:
      // Step 4: 搜索 Semantic Scholar 数据库（所有用户可用）
      const strategy4 = await analyzeUserIntent(text)
      const semanticResults = await searchSemanticScholar(strategy4.keywords)
      return NextResponse.json({
        step: 4,
        status: 'completed',
        sources: semanticResults,
        database: 'Semantic Scholar'
      })

    case 5:
      // Step 5: 智能筛选和去重，返回最终结果
      const strategy5 = await analyzeUserIntent(text)
      const allSources = await intelligentSearch(strategy5, limits.hasAdvancedDatabases)
      return NextResponse.json({
        step: 5,
        status: 'completed',
        sources: allSources,
        totalFound: allSources.length
      })

    default:
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
  }
}

/**
 * 智能分析用户输入，理解用户真正想要找什么类型的文献
 */
async function analyzeUserIntent(text: string): Promise<SearchStrategy> {
  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
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
              content: `You are an intelligent research assistant. Analyze the user's text and determine:
1. What type of research they need (medical/science/technology/social/general)
2. Extract 3-5 key search keywords
3. Which databases would be most relevant (CrossRef for general academic, PubMed for medical, Semantic Scholar for citations, arXiv for preprints, OpenAlex for comprehensive academic data)
4. Provide reasoning for your choices

Respond in JSON format:
{
  "searchType": "medical|science|technology|social|general",
  "keywords": ["keyword1", "keyword2", ...],
  "databases": ["CrossRef", "PubMed", "Semantic Scholar", "arXiv", "OpenAlex"],
  "reasoning": "explanation in Chinese"
}`
            },
            {
              role: 'user',
              content: `分析这段文本，用户想要找什么类型的文献？\n\n${text}`
            }
          ]
        },
        parameters: {
          result_format: 'message',
          max_tokens: 500
        }
      })
    })

    if (!response.ok) {
      throw new Error('LLM analysis failed')
    }

    const data = await response.json()
    const content = data.output?.choices?.[0]?.message?.content || data.output?.text || ''
    
    // 尝试解析 JSON
    try {
      const parsed = JSON.parse(content)
      return {
        keywords: parsed.keywords || [],
        searchType: parsed.searchType || 'general',
        databases: parsed.databases || ['CrossRef', 'Semantic Scholar'],
        reasoning: parsed.reasoning || '通用学术搜索'
      }
    } catch (e) {
      // 如果无法解析JSON，使用智能提取
      return await fallbackExtraction(text)
    }
  } catch (error) {
    console.error('Error in analyzeUserIntent:', error)
    return await fallbackExtraction(text)
  }
}

/**
 * 备用方案：基于关键词的智能提取
 */
async function fallbackExtraction(text: string): Promise<SearchStrategy> {
  const lowerText = text.toLowerCase()
  
  // 智能判断领域
  let searchType: SearchStrategy['searchType'] = 'general'
  let databases = ['CrossRef', 'Semantic Scholar', 'OpenAlex']
  
  if (lowerText.includes('医学') || lowerText.includes('medical') || 
      lowerText.includes('病') || lowerText.includes('药') ||
      lowerText.includes('health') || lowerText.includes('clinical')) {
    searchType = 'medical'
    databases = ['PubMed', 'CrossRef', 'Semantic Scholar', 'OpenAlex']
  } else if (lowerText.includes('计算机') || lowerText.includes('computer') ||
             lowerText.includes('算法') || lowerText.includes('algorithm') ||
             lowerText.includes('machine learning') || lowerText.includes('AI')) {
    searchType = 'technology'
    databases = ['CrossRef', 'arXiv', 'Semantic Scholar', 'OpenAlex']
  } else if (lowerText.includes('物理') || lowerText.includes('physics') ||
             lowerText.includes('化学') || lowerText.includes('chemistry') ||
             lowerText.includes('生物') || lowerText.includes('biology')) {
    searchType = 'science'
    databases = ['CrossRef', 'PubMed', 'Semantic Scholar', 'OpenAlex']
  } else if (lowerText.includes('社会') || lowerText.includes('social') ||
             lowerText.includes('经济') || lowerText.includes('economic') ||
             lowerText.includes('心理') || lowerText.includes('psychology')) {
    searchType = 'social'
    databases = ['CrossRef', 'Semantic Scholar', 'OpenAlex']
  }

  // 提取关键词
  const words = text.split(/\s+/).filter(w => w.length > 3)
  const keywords = words.slice(0, 5)

  return {
    keywords,
    searchType,
    databases,
    reasoning: `基于内容分析，这是${searchType}领域的研究查询`
  }
}

/**
 * 智能搜索：根据策略选择性搜索数据库
 */
async function intelligentSearch(strategy: SearchStrategy, hasAdvancedDatabases: boolean = false): Promise<Source[]> {
  const searchPromises: Promise<Source[]>[] = []

  // 免费用户只能使用基础数据库
  if (!hasAdvancedDatabases) {
    // 免费用户只能使用 CrossRef、Semantic Scholar 和 OpenAlex
    if (strategy.databases.includes('CrossRef')) {
      searchPromises.push(searchCrossRef(strategy.keywords))
    }
    if (strategy.databases.includes('Semantic Scholar')) {
      searchPromises.push(searchSemanticScholar(strategy.keywords))
    }
    if (strategy.databases.includes('OpenAlex')) {
      searchPromises.push(searchOpenAlex(strategy.keywords))
    }
  } else {
    // 付费用户可以使用所有数据库
    if (strategy.databases.includes('CrossRef')) {
      searchPromises.push(searchCrossRef(strategy.keywords))
    }
    if (strategy.databases.includes('PubMed')) {
      searchPromises.push(searchPubMed(strategy.keywords))
    }
    if (strategy.databases.includes('Semantic Scholar')) {
      searchPromises.push(searchSemanticScholar(strategy.keywords))
    }
    if (strategy.databases.includes('arXiv')) {
      searchPromises.push(searchArxiv(strategy.keywords))
    }
    if (strategy.databases.includes('OpenAlex')) {
      searchPromises.push(searchOpenAlex(strategy.keywords))
    }
  }

  const results = await Promise.all(searchPromises)
  const allSources = results.flat()
  
  // 去重和排序
  const uniqueSources = deduplicateSources(allSources)
  return uniqueSources.slice(0, 10)
}

/**
 * 去重：基于 DOI 或标题相似度
 */
function deduplicateSources(sources: Source[]): Source[] {
  const seen = new Set<string>()
  const unique: Source[] = []

  for (const source of sources) {
    const key = source.doi || source.title.toLowerCase().slice(0, 50)
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(source)
    }
  }

  return unique
}

/**
 * 搜索 CrossRef - 全球最大的学术引用数据库
 */
async function searchCrossRef(keywords: string[]): Promise<Source[]> {
  try {
    const query = keywords.join(' ')
    const response = await fetch(
      `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5&select=DOI,title,author,published,container-title`,
      {
        headers: {
          'User-Agent': 'Citea/1.0 (mailto:support@citea.com)'
        }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return (data.message?.items || []).map((item: any) => ({
      id: item.DOI || `crossref-${Math.random()}`,
      title: Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled',
      authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`).filter(Boolean).join(', ') || 'Unknown',
      year: item.published?.['date-parts']?.[0]?.[0] || 'N/A',
      journal: Array.isArray(item['container-title']) ? item['container-title'][0] : item['container-title'] || 'Unknown',
      doi: item.DOI || null,
      source: 'CrossRef',
      verified: true
    })).filter((s: Source) => s.title !== 'Untitled')
  } catch (error) {
    console.error('CrossRef search error:', error)
    return []
  }
}

/**
 * 搜索 PubMed - 生物医学文献数据库
 */
async function searchPubMed(keywords: string[]): Promise<Source[]> {
  try {
    const query = keywords.join('+')
    
    const searchResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=3&retmode=json`
    )

    if (!searchResponse.ok) return []

    const searchData = await searchResponse.json()
    const pmids = searchData.esearchresult?.idlist || []

    if (pmids.length === 0) return []

    const summaryResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`
    )

    if (!summaryResponse.ok) return []

    const summaryData = await summaryResponse.json()
    
    return pmids.map((pmid: string) => {
      const article = summaryData.result[pmid]
      if (!article) return null

      return {
        id: `PMID:${pmid}`,
        title: article.title || 'Untitled',
        authors: article.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
        year: article.pubdate?.split(' ')[0] || 'N/A',
        journal: article.source || 'Unknown',
        doi: article.elocationid || null,
        source: 'PubMed',
        verified: true
      }
    }).filter(Boolean) as Source[]
  } catch (error) {
    console.error('PubMed search error:', error)
    return []
  }
}

/**
 * 搜索 Semantic Scholar - AI 驱动的学术搜索引擎
 */
async function searchSemanticScholar(keywords: string[]): Promise<Source[]> {
  try {
    const query = keywords.join(' ')
    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=3&fields=title,authors,year,venue,externalIds`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    
    return (data.data || []).map((paper: any) => ({
      id: paper.paperId || `semantic-${Math.random()}`,
      title: paper.title || 'Untitled',
      authors: paper.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
      year: paper.year || 'N/A',
      journal: paper.venue || 'Unknown',
      doi: paper.externalIds?.DOI || null,
      source: 'Semantic Scholar',
      verified: true
    })).filter((s: Source) => s.title !== 'Untitled')
  } catch (error) {
    console.error('Semantic Scholar search error:', error)
    return []
  }
}

/**
 * 搜索 arXiv - 预印本论文数据库
 */
async function searchArxiv(keywords: string[]): Promise<Source[]> {
  try {
    const query = keywords.join(' AND ')
    const response = await fetch(
      `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=3`,
      {
        headers: {
          'Accept': 'application/atom+xml'
        }
      }
    )

    if (!response.ok) return []

    const xmlText = await response.text()
    
    // 简单的 XML 解析（可以使用 xml2js 库，但这里简化处理）
    const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || []
    
    return entries.map((entry: string) => {
      const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/)
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)
      const authorMatches = entry.match(/<name>([\s\S]*?)<\/name>/g)
      const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/)
      
      const arxivId = idMatch ? idMatch[1].split('/').pop() : null
      
      return {
        id: `arxiv-${arxivId}`,
        title: titleMatch ? titleMatch[1].trim() : 'Untitled',
        authors: authorMatches ? authorMatches.map((m: string) => m.replace(/<\/?name>/g, '')).join(', ') : 'Unknown',
        year: publishedMatch ? publishedMatch[1].substring(0, 4) : 'N/A',
        journal: 'arXiv preprint',
        doi: null,
        source: 'arXiv',
        verified: true
      }
    }).filter((s: Source) => s.title !== 'Untitled')
  } catch (error) {
    console.error('arXiv search error:', error)
    return []
  }
}

/**
 * 搜索 OpenAlex - 开放学术数据库（包含超过 2.5 亿篇学术作品）
 */
async function searchOpenAlex(keywords: string[]): Promise<Source[]> {
  try {
    const query = keywords.join(' ')
    const response = await fetch(
      `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=5&select=id,doi,title,authorships,publication_year,primary_location`,
      {
        headers: {
          'User-Agent': 'Citea/1.0 (mailto:support@citea.app)',
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    
    return (data.results || []).map((work: any) => {
      // 提取作者名
      const authors = work.authorships
        ?.slice(0, 3)
        ?.map((a: any) => a.author?.display_name)
        ?.filter(Boolean)
        ?.join(', ') || 'Unknown'
      
      // 提取期刊名
      const journal = work.primary_location?.source?.display_name || 'Unknown'
      
      // 提取 DOI（去掉 https://doi.org/ 前缀）
      const doi = work.doi ? work.doi.replace('https://doi.org/', '') : null

      return {
        id: work.id || `openalex-${Math.random()}`,
        title: work.title || 'Untitled',
        authors,
        year: work.publication_year?.toString() || 'N/A',
        journal,
        doi,
        source: 'OpenAlex',
        verified: true
      }
    }).filter((s: Source) => s.title !== 'Untitled')
  } catch (error) {
    console.error('OpenAlex search error:', error)
    return []
  }
}
