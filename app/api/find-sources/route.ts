import { NextRequest, NextResponse } from 'next/server'

const TONGYI_API_KEY = 'sk-9bf19547ddbd4be1a87a7a43cf251097'

// Academic database APIs
async function searchCrossRef(query: string) {
  try {
    const response = await fetch(
      `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5`,
      { headers: { 'User-Agent': 'Citea/1.0 (mailto:support@citea.com)' } }
    )
    const data = await response.json()
    return data.message?.items || []
  } catch (error) {
    console.error('CrossRef error:', error)
    return []
  }
}

async function searchSemanticScholar(query: string) {
  try {
    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,authors,year,abstract,url,externalIds`,
      { headers: { 'User-Agent': 'Citea/1.0' } }
    )
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Semantic Scholar error:', error)
    return []
  }
}

async function searchPubMed(query: string) {
  try {
    const searchResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json`
    )
    const searchData = await searchResponse.json()
    const ids = searchData.esearchresult?.idlist || []
    
    if (ids.length === 0) return []
    
    const summaryResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
    )
    const summaryData = await summaryResponse.json()
    return ids.map((id: string) => summaryData.result?.[id]).filter(Boolean)
  } catch (error) {
    console.error('PubMed error:', error)
    return []
  }
}

async function enhanceWithAI(query: string, sources: any[]) {
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
              content: 'You are an academic research assistant. Analyze the search query and suggest relevant research areas and keywords.'
            },
            {
              role: 'user',
              content: `Research query: "${query}". Provide 2-3 key insights about this research area.`
            }
          ]
        },
        parameters: {
          max_tokens: 200
        }
      })
    })
    
    const data = await response.json()
    return data.output?.text || ''
  } catch (error) {
    console.error('AI enhancement error:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Search multiple databases in parallel
    const [crossRefResults, semanticScholarResults, pubMedResults] = await Promise.all([
      searchCrossRef(query),
      searchSemanticScholar(query),
      searchPubMed(query)
    ])

    // Process and normalize results
    const sources = []

    // Process CrossRef results
    for (const item of crossRefResults.slice(0, 3)) {
      sources.push({
        title: item.title?.[0] || 'Untitled',
        authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`).filter(Boolean) || ['Unknown'],
        year: item.published?.['date-parts']?.[0]?.[0]?.toString() || 'N/A',
        doi: item.DOI,
        url: item.URL || `https://doi.org/${item.DOI}`,
        abstract: item.abstract?.substring(0, 300) + '...' || '',
        source: 'CrossRef'
      })
    }

    // Process Semantic Scholar results
    for (const item of semanticScholarResults.slice(0, 2)) {
      sources.push({
        title: item.title || 'Untitled',
        authors: item.authors?.map((a: any) => a.name) || ['Unknown'],
        year: item.year?.toString() || 'N/A',
        doi: item.externalIds?.DOI,
        url: item.url,
        abstract: item.abstract?.substring(0, 300) + '...' || '',
        source: 'Semantic Scholar'
      })
    }

    // Process PubMed results
    for (const item of pubMedResults.slice(0, 2)) {
      sources.push({
        title: item.title || 'Untitled',
        authors: item.authors?.map((a: any) => a.name)?.slice(0, 3) || ['Unknown'],
        year: item.pubdate?.split(' ')[0] || 'N/A',
        doi: item.elocationid?.replace('doi: ', ''),
        url: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`,
        abstract: '',
        source: 'PubMed'
      })
    }

    return NextResponse.json({ sources, total: sources.length })
  } catch (error) {
    console.error('Error in find-sources:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

