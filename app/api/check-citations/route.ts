import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const TONGYI_API_KEY = process.env.TONGYI_API_KEY || 'sk-9bf19547ddbd4be1a87a7a43cf251097'
const TONGYI_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

interface Citation {
  id: string
  text: string
  verified: boolean
  status: 'valid' | 'invalid' | 'uncertain'
  doi?: string
  pmid?: string
  source?: string
  reason?: string
  confidence?: number
}

// Extract citations from text
function extractCitations(text: string): string[] {
  // Match common citation patterns
  const patterns = [
    // Author et al. (Year)
    /[A-Z][a-z]+(?:,?\s+[A-Z]\.?)?\s+(?:et al\.)?\s*\(\d{4}\)/g,
    // Author, A. (Year). Title. Journal, Volume(Issue), Pages.
    /[A-Z][a-z]+,\s+[A-Z]\.\s*\(\d{4}\)\..*?\.\s+[A-Za-z\s&]+,\s+\d+\(\d+\),\s+\d+-\d+\./g,
    // Full APA style citations
    /[A-Z][a-z]+,\s+[A-Z]\.\s*(?:&\s+[A-Z][a-z]+,\s+[A-Z]\.)?\s*\(\d{4}\)\..*?\./g,
  ]
  
  const matches: string[] = []
  patterns.forEach(pattern => {
    const found = text.match(pattern)
    if (found) {
      matches.push(...found)
    }
  })
  
  return Array.from(new Set(matches))
}

// Verify citation using LLM and databases
async function verifyCitation(citation: string): Promise<Citation> {
  try {
    // Use LLM to extract structured information
    const prompt = `
Analyze this academic citation and extract key information. Determine if it looks like a legitimate academic citation.

Citation: "${citation}"

Provide a JSON response with:
{
  "authors": "author names",
  "year": "publication year",
  "title": "paper title if available",
  "journal": "journal name if available",
  "isLegitimate": true/false,
  "reason": "brief explanation",
  "confidence": 0.0-1.0
}
`

    const response = await axios.post(TONGYI_API_URL, {
      model: 'qwen-turbo',
      input: {
        messages: [{ role: 'user', content: prompt }],
      },
      parameters: {
        result_format: 'message',
        temperature: 0.3,
      },
    }, {
      headers: {
        'Authorization': `Bearer ${TONGYI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const content = response.data.output.choices[0].message.content
    const analysis = JSON.parse(content)

    // Try to verify in databases
    let verified = false
    let source = undefined
    let doi = undefined

    // Search CrossRef if we have enough info
    if (analysis.authors && analysis.year) {
      try {
        const searchQuery = `${analysis.authors} ${analysis.year} ${analysis.title || ''}`
        const crossrefResponse = await axios.get(
          `https://api.crossref.org/works?query=${encodeURIComponent(searchQuery)}&rows=1`
        )
        
        if (crossrefResponse.data.message.items.length > 0) {
          const item = crossrefResponse.data.message.items[0]
          verified = true
          source = 'CrossRef'
          doi = item.DOI
        }
      } catch (err) {
        console.log('CrossRef search failed:', err)
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      text: citation,
      verified,
      status: verified ? 'valid' : (analysis.confidence > 0.5 ? 'uncertain' : 'invalid'),
      doi,
      source,
      reason: analysis.reason,
      confidence: analysis.confidence,
    }
  } catch (error) {
    console.error('Citation verification error:', error)
    return {
      id: Math.random().toString(36).substr(2, 9),
      text: citation,
      verified: false,
      status: 'uncertain',
      reason: 'Unable to verify automatically',
      confidence: 0.5,
    }
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

    // Verify each citation
    const results = await Promise.all(
      citations.map(citation => verifyCitation(citation))
    )

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
