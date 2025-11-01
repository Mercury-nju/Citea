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
  ArrowUp
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

  const examplePrompts = {
    finder: [
      'Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs through phonon interactions.',
      'machine learning in healthcare applications',
      'quantum computing recent advances',
    ],
    checker: 'Recent studies have shown significant progress (Smith et al., 2023). Machine learning algorithms improve accuracy (Johnson & Brown, 2022). The findings support earlier work (Davis, 2021).',
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo & Menu Toggle */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Logo />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/>
              <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/>
              <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* New Document Button */}
        <div className="p-4">
          <button
            onClick={handleNewDocument}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            {t.dashboard.newDocument}
          </button>
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t.dashboard.searchDocs}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t.dashboard.past7Days}
            </h3>
            <div className="space-y-1">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleHistoryClick(doc)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {doc.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500">{doc.date}</p>
                          {doc.type === 'finder' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              搜索
                            </span>
                          )}
                          {doc.type === 'checker' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                              验证
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-gray-500">
                  {t.dashboard.noHistory || '暂无搜索历史'}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Upgrade to Pro */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-3">
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{t.dashboard.upgradeToPro}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  {t.dashboard.upgradeDesc}
                </p>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium mt-2">
              {t.dashboard.tryPro}
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">{t.dashboard.freePlan}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition"
              title={t.dashboard.logout}
            >
              <LogOut size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              {t.dashboard.researchAssistant}
            </h1>
            <p className="text-sm text-gray-600">
              {t.dashboard.researchSubtitle}
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-1 mb-8">
              <button
                onClick={() => setActiveTab('finder')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'finder'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {t.dashboard.findSources}
              </button>
              <button
                onClick={() => setActiveTab('checker')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'checker'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {t.dashboard.verifyCitations}
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'assistant'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {t.dashboard.chat}
                <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {t.dashboard.beta}
                </span>
              </button>
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
                {activeTab === 'assistant' && (
                <div className="p-6">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.dashboard.pasteText}
                    className="w-full h-64 p-4 border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
                    maxLength={300}
                  />
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {query.length}/300 {t.dashboard.characterCount}
                    </span>
                    <button
                      onClick={() => setLoading(true)}
                      disabled={!query.trim()}
                      className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <ArrowUp size={18} />
                    </button>
                  </div>
                  </div>
                )}
              </div>
            )}

            {/* Example Prompts - Only show for assistant */}
            {activeTab === 'assistant' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {activeTab === 'assistant' && (
                <div className="p-6">
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="mx-auto mb-3" size={48} />
                      <p className="text-sm">{t.dashboard.startConversation}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.dashboard.enterQuestion}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={300}
                    />
                    <button
                      onClick={() => setLoading(true)}
                      disabled={!query.trim()}
                      className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <ArrowUp size={18} />
                    </button>
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Example Prompts - Only show for checker and assistant */}
            {activeTab !== 'finder' && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-yellow-500" size={18} />
                <span className="text-sm font-medium text-gray-700">{t.dashboard.examples}</span>
              </div>
              
              {activeTab === 'checker' && (
                <button
                  onClick={() => setQuery(examplePrompts.checker)}
                  className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-sm text-gray-700"
                >
                  {examplePrompts.checker}
                </button>
              )}

              {activeTab === 'assistant' && (
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
              )}
            </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
