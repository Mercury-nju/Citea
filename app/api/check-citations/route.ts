import { NextRequest, NextResponse } from 'next/server'

const TONGYI_API_KEY = 'sk-9bf19547ddbd4be1a87a7a43cf251097'

function extractCitations(text: string): string[] {
  // Simple citation extraction (looks for patterns like Author et al., Year)
  const citationPattern = /([A-Z][a-z]+(?:\s+(?:et\s+al\.|and\s+[A-Z][a-z]+))?,?\s+\d{4})|(\([A-Z][a-z]+(?:\s+(?:et\s+al\.|&\s+[A-Z][a-z]+))?,?\s+\d{4}\))/g
  const matches = text.match(citationPattern) || []
  return Array.from(new Set(matches))
}

async function verifyCitationWithAI(citation: string) {
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
              content: 'You are a citation verification expert. Analyze if a citation appears to be legitimate or potentially fabricated. Respond with a JSON object containing: isValid (boolean), confidence (0-1), and details (string explanation).'
            },
            {
              role: 'user',
              content: `Analyze this citation: "${citation}". Is it likely to be a real, legitimate academic citation? Consider the format, author names, and year.`
            }
          ]
        },
        parameters: {
          max_tokens: 200,
          result_format: 'message'
        }
      })
    })
    
    const data = await response.json()
    const aiResponse = data.output?.choices?.[0]?.message?.content || data.output?.text || ''
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(aiResponse)
      return parsed
    } catch {
      // If not JSON, provide default analysis
      const isValid = !aiResponse.toLowerCase().includes('fake') && 
                     !aiResponse.toLowerCase().includes('fabricated') &&
                     !aiResponse.toLowerCase().includes('invalid')
      
      return {
        isValid,
        confidence: isValid ? 0.7 : 0.3,
        details: aiResponse
      }
    }
  } catch (error) {
    console.error('AI verification error:', error)
    return {
      isValid: true,
      confidence: 0.5,
      details: 'Unable to verify with AI. Manual verification recommended.'
    }
  }
}

async function verifyCitationWithDatabase(citation: string) {
  // Extract author and year from citation
  const yearMatch = citation.match(/\d{4}/)
  const year = yearMatch ? yearMatch[0] : ''
  
  const authorMatch = citation.match(/([A-Z][a-z]+)/)
  const author = authorMatch ? authorMatch[1] : ''
  
  if (!author || !year) {
    return null
  }

  try {
    // Search CrossRef
    const response = await fetch(
      `https://api.crossref.org/works?query.author=${encodeURIComponent(author)}&filter=from-pub-date:${year},until-pub-date:${year}&rows=1`,
      { headers: { 'User-Agent': 'Citea/1.0 (mailto:support@citea.com)' } }
    )
    const data = await response.json()
    
    if (data.message?.items?.length > 0) {
      return {
        found: true,
        source: 'CrossRef',
        title: data.message.items[0].title?.[0]
      }
    }
  } catch (error) {
    console.error('Database verification error:', error)
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Extract citations from text
    const extractedCitations = extractCitations(text)
    
    if (extractedCitations.length === 0) {
      return NextResponse.json({ 
        citations: [],
        message: 'No citations found in the text. Try including citations in formats like "Smith et al., 2020" or "(Johnson, 2019)"'
      })
    }

    // Verify each citation
    const verificationPromises = extractedCitations.map(async (citation) => {
      // Check with database
      const dbResult = await verifyCitationWithDatabase(citation)
      
      // Check with AI
      const aiResult = await verifyCitationWithAI(citation)
      
      // Combine results
      let isValid = aiResult.isValid
      let confidence = aiResult.confidence
      let details = aiResult.details
      
      if (dbResult?.found) {
        isValid = true
        confidence = Math.max(confidence, 0.9)
        details = `Verified in ${dbResult.source}: ${dbResult.title}`
      }
      
      return {
        text: citation,
        isValid,
        confidence,
        details
      }
    })

    const citations = await Promise.all(verificationPromises)

    return NextResponse.json({ 
      citations,
      total: citations.length,
      verified: citations.filter(c => c.isValid).length
    })
  } catch (error) {
    console.error('Error in check-citations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

