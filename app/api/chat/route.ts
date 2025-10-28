import { NextRequest, NextResponse } from 'next/server'

const TONGYI_API_KEY = 'sk-9bf19547ddbd4be1a87a7a43cf251097'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    // Call Tongyi Qianwen API
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
              content: `You are a helpful AI research assistant for Citea, a free citation verification and source finding tool. 
              
Your expertise includes:
- Helping researchers verify citations and check for fake references
- Finding credible academic sources from databases like CrossRef, PubMed, arXiv, and Semantic Scholar
- Explaining citation formats (APA, MLA, Chicago, etc.)
- Providing guidance on academic integrity and research best practices
- Detecting potentially fabricated or AI-generated citations

Always be helpful, accurate, and professional. Emphasize that Citea is completely free to use.`
            },
            ...messages
          ]
        },
        parameters: {
          max_tokens: 1000,
          temperature: 0.7,
          result_format: 'message'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Tongyi API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Extract response from Tongyi API
    const aiResponse = data.output?.choices?.[0]?.message?.content || 
                       data.output?.text || 
                       'I apologize, but I encountered an error. Please try again.'

    return NextResponse.json({ 
      response: aiResponse,
      model: 'qwen-turbo'
    })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ 
      response: 'I apologize, but I encountered an error processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

