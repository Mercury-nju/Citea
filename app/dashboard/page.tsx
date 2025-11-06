'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { 
  FileText, 
  Search, 
  Plus, 
  Settings, 
  LogOut, 
  ChevronRight,
  Sparkles,
  BookOpen,
  CheckCircle,
  MessageSquare,
  ArrowUp,
  Edit3
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import SourceFinderInterface from '@/components/SourceFinderInterface'
import CitationCheckerInterface from '@/components/CitationCheckerInterface'

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'finder' | 'checker' | 'assistant'>('finder')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  
  // 从 localStorage 加载搜索历史
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`citea_search_history_${user.email}`)
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory)
          setDocuments(history)
        } catch (e) {
          console.error('Failed to load search history:', e)
        }
      }
    }
  }, [user])
  
  // 保存搜索历史到 localStorage
  const saveSearchHistory = (searchType: 'finder' | 'checker', query: string, results?: any) => {
    if (!user) return
    
    const newDoc = {
      id: Date.now().toString(),
      title: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      date: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      type: searchType,
      fullQuery: query,
      results: results,
      timestamp: Date.now()
    }
    
    const updated = [newDoc, ...documents.filter(d => d.id !== newDoc.id)].slice(0, 50) // 最多保存50条
    setDocuments(updated)
    
    try {
      localStorage.setItem(`citea_search_history_${user.email}`, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save search history:', e)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      // 从 localStorage 获取 token
      const token = localStorage.getItem('citea_auth_token')
      
      console.log('[Dashboard] 开始认证检查，token 存在:', !!token)
      
      if (!token) {
        console.log('[Dashboard] ❌ 没有 token，跳转到登录页')
        router.push('/auth/signin')
        return
      }
      
      console.log('[Dashboard] Token 长度:', token.length)
      
      // 尝试从 localStorage 恢复用户信息（先显示，提升体验）
      const savedUser = localStorage.getItem('citea_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          console.log('[Dashboard] 从 localStorage 恢复用户信息:', userData.email)
          setUser(userData)
        } catch (e) {
          console.error('[Dashboard] 解析用户信息失败:', e)
        }
      }
      
      // 验证 token
      try {
        // 先测试 token 是否有效
        console.log('[Dashboard] 先测试 token 有效性...')
        const testRes = await fetch('/api/auth/test-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        })
        const testData = await testRes.json()
        console.log('[Dashboard] Token 测试结果:', JSON.stringify(testData, null, 2))
        
        console.log('[Dashboard] 发送认证请求到 /api/auth/me')
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log('[Dashboard] 认证响应状态:', res.status)
        const data = await res.json()
        console.log('[Dashboard] 认证响应数据:', JSON.stringify(data, null, 2))
        
        if (data.user) {
          console.log('[Dashboard] ✅ 认证成功，用户:', data.user.email)
          // 更新用户信息
          setUser(data.user)
          localStorage.setItem('citea_user', JSON.stringify(data.user))
        } else {
          console.error('[Dashboard] ❌ Token 验证失败')
          console.error('[Dashboard] 错误信息:', data.error)
          console.error('[Dashboard] 完整响应:', JSON.stringify(data, null, 2))
          
          // 如果验证失败，清除 token 并跳转
          localStorage.removeItem('citea_auth_token')
          localStorage.removeItem('citea_user')
          console.log('[Dashboard] 清除 token，跳转到登录页')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('[Dashboard] ❌ 认证检查异常:', error)
        console.error('[Dashboard] 异常详情:', error instanceof Error ? error.stack : String(error))
        // 清除 token 并跳转
        localStorage.removeItem('citea_auth_token')
        localStorage.removeItem('citea_user')
        router.push('/auth/signin')
      }
    }
    
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  const handleNewDocument = () => {
    // 切换到对应的 tab 并清空输入
    setActiveTab('finder')
    setQuery('')
  }
  
  const handleHistoryClick = (doc: any) => {
    if (doc.type === 'finder') {
      setActiveTab('finder')
    } else if (doc.type === 'checker') {
      setActiveTab('checker')
    }
  }

  const handleChatSubmit = async () => {
    if (!query.trim() || loading) return

    const userMessage = query.trim()
    setQuery('')
    setLoading(true)

    // 检测用户语言
    const isChinese = /[\u4e00-\u9fa5]/.test(userMessage)

    // 添加用户消息
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
      
      // 添加 AI 回复
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t.dashboard.researchAssistant || 'Research Assistant'}
        </h1>
        <p className="text-gray-600">
          {t.dashboard.researchSubtitle || 'Your AI-powered research companion'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Write Card */}
                <button
                  onClick={() => router.push('/dashboard/write')}
                  className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="mb-3">
                      <Edit3 size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Edit3 size={20} />
                      Write
                    </h3>
                    <p className="text-sm text-white/90">
                      Paraphrase, rewrite, auto-cite, and more
                    </p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                </button>

                {/* Find Sources Card */}
                <button
                  onClick={() => setActiveTab('finder')}
                  className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                    activeTab === 'finder' 
                      ? 'shadow-xl scale-105' 
                      : 'shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="mb-3">
                      <Search size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Search size={20} />
                      Find Sources
                    </h3>
                    <p className="text-sm text-white/90">
                      Search academic databases and discover credible sources
                    </p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                </button>

                {/* Verify Citations Card */}
                <button
                  onClick={() => setActiveTab('checker')}
                  className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                    activeTab === 'checker' 
                      ? 'shadow-xl scale-105' 
                      : 'shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="mb-3">
                      <CheckCircle size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <CheckCircle size={20} />
                      Verify Citations
                    </h3>
                    <p className="text-sm text-white/90">
                      Check citation authenticity and detect fake references
                    </p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                </button>

                {/* Chat Assistant Card */}
                <button
                  onClick={() => setActiveTab('assistant')}
                  className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                    activeTab === 'assistant' 
                      ? 'shadow-xl scale-105' 
                      : 'shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="mb-3">
                      <MessageSquare size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <MessageSquare size={20} />
                      Chat Assistant
                    </h3>
                    <p className="text-sm text-white/90">
                      Get help with citations, formatting, and research questions
                    </p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                </button>
              </div>
            </div>

            {/* Main Input Area */}
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
                {/* Chat is available to all users; consumes credits */}
                <div className="p-6">
                  {/* Chat Messages */}
                  <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                    {chatMessages.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <MessageSquare className="mx-auto mb-3" size={48} />
                          <p className="text-sm">{t.dashboard.startConversation}</p>
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

                  {/* Input Area */}
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
                      placeholder={t.dashboard.enterQuestion}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      disabled={loading}
                    />
                    <button
                      onClick={handleChatSubmit}
                      disabled={!query.trim() || loading}
                      className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                      title={undefined}
                    >
                      <ArrowUp size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            

            {/* Example Prompts - Only show for assistant */}
            {activeTab === 'assistant' && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-yellow-500" size={18} />
                <span className="text-sm font-medium text-gray-700">{t.dashboard.examples}</span>
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
    </div>
  )
}
