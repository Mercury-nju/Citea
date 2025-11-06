'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  CheckCircle,
  MessageSquare,
  ArrowUp,
  Edit3,
  Sparkles
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import SourceFinderInterface from '@/components/SourceFinderInterface'
import CitationCheckerInterface from '@/components/CitationCheckerInterface'

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'finder' | 'checker' | 'assistant'>('finder')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  
  const saveSearchHistory = (searchType: 'finder' | 'checker', query: string, results?: any) => {
    const user = JSON.parse(localStorage.getItem('citea_user') || '{}')
    if (!user.email) return
    
    const newDoc = {
      id: Date.now().toString(),
      title: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      date: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      type: searchType,
      fullQuery: query,
      results: results,
      timestamp: Date.now()
    }
    
    const savedHistory = localStorage.getItem(`citea_search_history_${user.email}`)
    const history = savedHistory ? JSON.parse(savedHistory) : []
    const updated = [newDoc, ...history.filter((d: any) => d.id !== newDoc.id)].slice(0, 50)
    
    try {
      localStorage.setItem(`citea_search_history_${user.email}`, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save search history:', e)
    }
  }

  const handleChatSubmit = async () => {
    if (!query.trim() || loading) return

    const userMessage = query.trim()
    setQuery('')
    setLoading(true)

    const isChinese = /[\u4e00-\u9fa5]/.test(userMessage)

    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const language = isChinese ? 'Chinese' : 'English'
      
      const token = localStorage.getItem('citea_auth_token')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ],
          language: language
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Chat failed')
      }

      const data = await response.json()
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Sorry, I could not process your request.' }])
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: isChinese ? '抱歉，处理您的请求时出现错误，请重试。' : 'Sorry, I encountered an error processing your request. Please try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const examplePrompts = {
    assistant: [
      '如何引用网站？',
      'What is the difference between primary and secondary sources?',
      '如何判断期刊是否正规？',
    ]
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t.dashboard?.researchAssistant || 'Research Assistant'}
        </h1>
        <p className="text-gray-600">
          {t.dashboard?.researchSubtitle || 'Your AI-powered research companion'}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/dashboard/write')}
                className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                }}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Edit3 size={20} />
                    Write
                  </h3>
                  <p className="text-sm text-white/90">
                    Paraphrase, rewrite, auto-cite, and more
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('finder')}
                className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                  activeTab === 'finder' 
                    ? 'shadow-xl scale-105' 
                    : 'shadow-lg hover:shadow-xl hover:scale-105'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Search size={20} />
                    Find Sources
                  </h3>
                  <p className="text-sm text-white/90">
                    Search academic databases and discover credible sources
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('checker')}
                className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                  activeTab === 'checker' 
                    ? 'shadow-xl scale-105' 
                    : 'shadow-lg hover:shadow-xl hover:scale-105'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                }}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Verify Citations
                  </h3>
                  <p className="text-sm text-white/90">
                    Check citation authenticity and detect fake references
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
                  activeTab === 'assistant' 
                    ? 'shadow-xl scale-105' 
                    : 'shadow-lg hover:shadow-xl hover:scale-105'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                }}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Chat Assistant
                  </h3>
                  <p className="text-sm text-white/90">
                    Get help with citations, formatting, and research questions
                  </p>
                </div>
              </button>
            </div>
          </div>

          {activeTab === 'finder' && (
            <SourceFinderInterface 
              onSearchComplete={(query: string, results?: any) => saveSearchHistory('finder', query, results)}
            />
          )}
          
          {activeTab === 'checker' && (
            <CitationCheckerInterface 
              onCheckComplete={(query: string, results?: any) => saveSearchHistory('checker', query, results)}
            />
          )}

          {activeTab === 'assistant' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <MessageSquare className="mx-auto mb-3" size={48} />
                        <p className="text-sm">{t.dashboard?.startConversation || 'Start a conversation'}</p>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && query.trim() && !loading) {
                        e.preventDefault()
                        handleChatSubmit()
                      }
                    }}
                    placeholder={t.dashboard?.enterQuestion || 'Ask a question...'}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    disabled={loading}
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={!query.trim() || loading}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assistant' && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-yellow-500" size={18} />
                <span className="text-sm font-medium text-gray-700">{t.dashboard?.examples || 'Examples'}</span>
              </div>

              <div className="space-y-2">
                {examplePrompts.assistant.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(prompt)}
                    className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-sm text-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
