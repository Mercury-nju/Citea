'use client'

import { useState } from 'react'
import { Search, CheckCircle, MessageSquare, Loader2, ExternalLink, Download } from 'lucide-react'

type ToolType = 'finder' | 'checker' | 'assistant'

interface Source {
  title: string
  authors: string[]
  year: string
  doi?: string
  url?: string
  abstract?: string
  source: string
}

interface Citation {
  text: string
  isValid: boolean
  confidence: number
  details?: string
}

export default function Tools() {
  const [activeTab, setActiveTab] = useState<ToolType>('finder')
  const [loading, setLoading] = useState(false)
  
  // Source Finder states
  const [searchQuery, setSearchQuery] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  
  // Citation Checker states
  const [citationText, setCitationText] = useState('')
  const [checkedCitations, setCheckedCitations] = useState<Citation[]>([])
  
  // AI Assistant states
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [userMessage, setUserMessage] = useState('')

  const handleFindSources = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/find-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })
      const data = await response.json()
      setSources(data.sources || [])
    } catch (error) {
      console.error('Error finding sources:', error)
      alert('Error finding sources. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckCitations = async () => {
    if (!citationText.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/check-citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: citationText })
      })
      const data = await response.json()
      setCheckedCitations(data.citations || [])
    } catch (error) {
      console.error('Error checking citations:', error)
      alert('Error checking citations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return
    
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)
    setUserMessage('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await response.json()
      setMessages([...newMessages, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error communicating with assistant. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const exportCitation = (source: Source, format: string) => {
    let citation = ''
    const authors = source.authors.join(', ')
    
    switch (format) {
      case 'APA':
        citation = `${authors} (${source.year}). ${source.title}. ${source.doi ? `https://doi.org/${source.doi}` : source.url}`
        break
      case 'MLA':
        citation = `${authors}. "${source.title}." ${source.year}.`
        break
      case 'Chicago':
        citation = `${authors}. "${source.title}." ${source.year}.`
        break
    }
    
    navigator.clipboard.writeText(citation)
    alert(`${format} citation copied to clipboard!`)
  }

  return (
    <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Start verifying citations today
          </h2>
          <p className="text-xl text-gray-600">
            Ready to ensure every citation in your research is authentic? Start using Citea's powerful tools now.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('finder')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'finder'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Search size={20} />
            Source Finder
          </button>
          <button
            onClick={() => setActiveTab('checker')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'checker'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle size={20} />
            Citation Checker
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'assistant'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare size={20} />
            AI Assistant
          </button>
        </div>

        {/* Tool Content */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 min-h-[500px]">
          {/* Source Finder */}
          {activeTab === 'finder' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Academic Sources</h3>
              <p className="text-gray-600 mb-6">
                Enter your research topic or keywords to find credible academic sources from major databases.
              </p>
              
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFindSources()}
                  placeholder="e.g., machine learning in healthcare, climate change impacts..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleFindSources}
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                  Search
                </button>
              </div>

              <div className="space-y-4">
                {sources.map((source, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{source.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {source.authors.join(', ')} ({source.year})
                    </p>
                    {source.abstract && (
                      <p className="text-sm text-gray-700 mb-3">{source.abstract}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {source.source}
                      </span>
                      {source.doi && (
                        <a
                          href={`https://doi.org/${source.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"
                        >
                          DOI <ExternalLink size={12} />
                        </a>
                      )}
                      <button
                        onClick={() => exportCitation(source, 'APA')}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1"
                      >
                        <Download size={12} /> APA
                      </button>
                      <button
                        onClick={() => exportCitation(source, 'MLA')}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1"
                      >
                        <Download size={12} /> MLA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citation Checker */}
          {activeTab === 'checker' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Check Citations</h3>
              <p className="text-gray-600 mb-6">
                Paste your text with citations to verify their authenticity against academic databases.
              </p>
              
              <textarea
                value={citationText}
                onChange={(e) => setCitationText(e.target.value)}
                placeholder="Paste your text with citations here..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              />
              
              <button
                onClick={handleCheckCitations}
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                Verify Citations
              </button>

              <div className="mt-6 space-y-3">
                {checkedCitations.map((citation, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      citation.isValid
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {citation.isValid ? (
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                      ) : (
                        <span className="text-red-600 flex-shrink-0 text-xl">⚠️</span>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-900 mb-1">{citation.text}</p>
                        <p className="text-sm text-gray-600">
                          Confidence: {(citation.confidence * 100).toFixed(0)}%
                        </p>
                        {citation.details && (
                          <p className="text-sm text-gray-700 mt-2">{citation.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Assistant */}
          {activeTab === 'assistant' && (
            <div className="flex flex-col h-[500px]">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Research Assistant</h3>
              <p className="text-gray-600 mb-6">
                Chat with our AI assistant about citation verification, source validation, and research questions.
              </p>
              
              <div className="flex-1 bg-white rounded-lg border border-gray-300 p-4 mb-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Start a conversation! Ask me about citations, sources, or research questions.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about citations or research..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

