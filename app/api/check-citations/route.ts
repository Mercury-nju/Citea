import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const TONGYI_API_KEY = process.env.TONGYI_API_KEY || 'sk-9bf19547ddbd4be1a87a7a43cf251097'
const TONGYI_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

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

// Parse citation using AI
async function parseCitation(citation: string) {
  try {
    const prompt = `
Parse this academic citation and extract key information in JSON format:

Citation: "${citation}"

Return ONLY a JSON object with these fields:
{
  "title": "paper title",
  "authors": "author names",
  "journal": "journal or publication name",
  "year": "publication year",
  "volume": "volume number if available",
  "pages": "page numbers if available"
}

If a field is not found, use null.
`

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
      timeout: 15000,
    })

    const content = response.data.output.choices[0].message.content
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch (error) {
    console.error('Error parsing citation:', error)
    return null
  }
}

// Search for citation in databases
async function searchCitation(parsed: any) {
  if (!parsed || !parsed.title) return null

  try {
    // Search CrossRef
    const query = `${parsed.title || ''} ${parsed.authors || ''} ${parsed.year || ''}`
    const response = await axios.get(
      `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=1`,
      { timeout: 10000 }
    )

    if (response.data.message.items.length > 0) {
      const item = response.data.message.items[0]
      return {
        title: item.title ? item.title[0] : '',
        authors: item.author ? item.author.map((a: any) => `${a.given || ''} ${a.family || ''}`).join(', ') : '',
        year: item['published-print'] ? item['published-print']['date-parts'][0][0].toString() : 
              (item.issued ? item.issued['date-parts'][0][0].toString() : ''),
        doi: item.DOI,
        link: item.DOI ? `https://doi.org/${item.DOI}` : '',
      }
    }
  } catch (error) {
    console.error('Error searching citation:', error)
  }

  // Try Semantic Scholar as backup
  try {
    const query = parsed.title || ''
    const response = await axios.get(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=title,authors,year,externalIds&limit=1`,
      { timeout: 10000 }
    )

    if (response.data.data && response.data.data.length > 0) {
      const item = response.data.data[0]
      return {
        title: item.title || '',
        authors: item.authors ? item.authors.map((a: any) => a.name).join(', ') : '',
        year: item.year ? item.year.toString() : '',
        doi: item.externalIds?.DOI || '',
        link: item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : 
              `https://www.semanticscholar.org/paper/${item.paperId}`,
      }
    }
  } catch (error) {
    console.error('Error searching Semantic Scholar:', error)
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

// Verify single citation
async function verifyCitation(citation: string): Promise<Citation> {
  const id = Math.random().toString(36).substr(2, 9)
  
  // Parse citation
  const parsed = await parseCitation(citation)
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

  // Search for matches
  const match = await searchCitation(parsed)
  
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
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 })
  }

  try {
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

    // Verify each citation (with some delay to avoid rate limits)
    const results: Citation[] = []
    for (const citation of citations) {
      const result = await verifyCitation(citation)
      results.push(result)
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const verifiedCount = results.filter(r => r.verified).length
    const verificationRate = Math.round((verifiedCount / results.length) * 100)

    return NextResponse.json({
      citations: results,
      totalFound: results.length,
      verified: verifiedCount,
      verificationRate,
    })
  } catch (error) {
    console.error('Error in check-citations API:', error)
    return NextResponse.json({ error: 'Failed to check citations' }, { status: 500 })
  }
}
