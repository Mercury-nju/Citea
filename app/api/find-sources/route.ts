import { NextRequest, NextResponse } from 'next/server'

const TONGYI_API_KEY = 'sk-9bf19547ddbd4be1a87a7a43cf251097'

interface SearchStrategy {
  keywords: string[]
  searchType: 'medical' | 'science' | 'technology' | 'social' | 'general'
  databases: string[]
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Step 1: 智能分析用户意图，确定搜索策略
    const strategy = await analyzeUserIntent(text)

    // Step 2-5: 根据策略智能搜索相应数据库
    const sources = await intelligentSearch(strategy)

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
3. Which databases would be most relevant (CrossRef for general academic, PubMed for medical, Semantic Scholar for citations)
4. Provide reasoning for your choices

Respond in JSON format:
{
  "searchType": "medical|science|technology|social|general",
  "keywords": ["keyword1", "keyword2", ...],
  "databases": ["CrossRef", "PubMed", "Semantic Scholar"],
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
  let databases = ['CrossRef', 'Semantic Scholar']
  
  if (lowerText.includes('医学') || lowerText.includes('medical') || 
      lowerText.includes('病') || lowerText.includes('药') ||
      lowerText.includes('health') || lowerText.includes('clinical')) {
    searchType = 'medical'
    databases = ['PubMed', 'CrossRef', 'Semantic Scholar']
  } else if (lowerText.includes('计算机') || lowerText.includes('computer') ||
             lowerText.includes('算法') || lowerText.includes('algorithm') ||
             lowerText.includes('machine learning') || lowerText.includes('AI')) {
    searchType = 'technology'
    databases = ['CrossRef', 'Semantic Scholar']
  } else if (lowerText.includes('物理') || lowerText.includes('physics') ||
             lowerText.includes('化学') || lowerText.includes('chemistry') ||
             lowerText.includes('生物') || lowerText.includes('biology')) {
    searchType = 'science'
    databases = ['CrossRef', 'PubMed', 'Semantic Scholar']
  } else if (lowerText.includes('社会') || lowerText.includes('social') ||
             lowerText.includes('经济') || lowerText.includes('economic') ||
             lowerText.includes('心理') || lowerText.includes('psychology')) {
    searchType = 'social'
    databases = ['CrossRef', 'Semantic Scholar']
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
async function intelligentSearch(strategy: SearchStrategy): Promise<any[]> {
  const searchPromises: Promise<any[]>[] = []

  // 根据策略智能选择数据库
  if (strategy.databases.includes('CrossRef')) {
    searchPromises.push(searchCrossRef(strategy.keywords))
  }
  
  if (strategy.databases.includes('PubMed')) {
    searchPromises.push(searchPubMed(strategy.keywords))
  }
  
  if (strategy.databases.includes('Semantic Scholar')) {
    searchPromises.push(searchSemanticScholar(strategy.keywords))
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
function deduplicateSources(sources: any[]): any[] {
  const seen = new Set<string>()
  const unique: any[] = []

  for (const source of sources) {
    const key = source.doi || source.title.toLowerCase().slice(0, 50)
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(source)
    }
  }

  return unique
}

async function searchCrossRef(keywords: string[]): Promise<any[]> {
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
    return data.message.items.map((item: any) => ({
      id: item.DOI,
      title: Array.isArray(item.title) ? item.title[0] : item.title,
      authors: item.author?.map((a: any) => `${a.given} ${a.family}`).join(', ') || 'Unknown',
      year: item.published?.['date-parts']?.[0]?.[0] || 'N/A',
      journal: Array.isArray(item['container-title']) ? item['container-title'][0] : item['container-title'] || 'Unknown',
      doi: item.DOI,
      source: 'CrossRef',
      verified: true
    }))
  } catch (error) {
    console.error('CrossRef search error:', error)
    return []
  }
}

async function searchPubMed(keywords: string[]): Promise<any[]> {
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
    }).filter(Boolean)
  } catch (error) {
    console.error('PubMed search error:', error)
    return []
  }
}

async function searchSemanticScholar(keywords: string[]): Promise<any[]> {
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
      id: paper.paperId,
      title: paper.title || 'Untitled',
      authors: paper.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
      year: paper.year || 'N/A',
      journal: paper.venue || 'Unknown',
      doi: paper.externalIds?.DOI || null,
      source: 'Semantic Scholar',
      verified: true
    }))
  } catch (error) {
    console.error('Semantic Scholar search error:', error)
    return []
  }
}
