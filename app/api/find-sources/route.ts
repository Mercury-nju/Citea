import { NextRequest, NextResponse } from 'next/server'

const TONGYI_API_KEY = 'sk-9bf19547ddbd4be1a87a7a43cf251097'

interface SearchStep {
  id: number
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed'
  icon: string
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

    // Step 1: Extract key concepts using LLM
    const keywords = await extractKeywords(text)

    // Step 2-5: Search multiple databases
    const sources = await searchDatabases(keywords)

    return NextResponse.json({
      success: true,
      keywords,
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

async function extractKeywords(text: string): Promise<string[]> {
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
              content: 'You are a research assistant. Extract 3-5 key academic keywords or phrases from the given text for literature search. Return only the keywords, comma-separated.'
            },
            {
              role: 'user',
              content: text
            }
          ]
        },
        parameters: {
          max_tokens: 100
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to extract keywords')
    }

    const data = await response.json()
    const keywordsText = data.output?.text || ''
    return keywordsText.split(',').map((k: string) => k.trim()).filter(Boolean)
  } catch (error) {
    console.error('Error extracting keywords:', error)
    // Fallback: simple keyword extraction
    const words = text.split(/\s+/).filter(w => w.length > 3)
    return words.slice(0, 5)
  }
}

async function searchDatabases(keywords: string[]): Promise<any[]> {
  const results = await Promise.all([
    searchCrossRef(keywords),
    searchPubMed(keywords),
    searchSemanticScholar(keywords)
  ])

  // Combine and deduplicate results
  const allSources = results.flat()
  return allSources.slice(0, 10) // Limit to top 10 results
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
    
    // Step 1: Search for PMIDs
    const searchResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=3&retmode=json`
    )

    if (!searchResponse.ok) return []

    const searchData = await searchResponse.json()
    const pmids = searchData.esearchresult?.idlist || []

    if (pmids.length === 0) return []

    // Step 2: Fetch article details
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
