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

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'finder' | 'checker' | 'assistant'>('finder')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState([
    { id: 1, title: '[57]Anonymous. (2023). Bardeen-Cooper...', date: '2天前', type: 'citation' },
    { id: 2, title: '在认知心理学中...', date: '3天前', type: 'search' },
  ])

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('citea_auth')
    const userData = localStorage.getItem('citea_user')
    
    if (!auth || !userData) {
      router.push('/auth/signin')
      return
    }
    
    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('citea_auth')
    localStorage.removeItem('citea_user')
    router.push('/')
  }

  const handleNewDocument = () => {
    const newDoc = {
      id: documents.length + 1,
      title: '新文档',
      date: '刚刚',
      type: 'search'
    }
    setDocuments([newDoc, ...documents])
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
            新建文档
          </button>
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索文档..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              过去7天
            </h3>
            <div className="space-y-1">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition group"
                >
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{doc.date}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          <div className="mt-8 text-center py-8">
            <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-sm text-gray-500">
              已到达文档历史记录的末尾
            </p>
          </div>
        </div>

        {/* Upgrade to Pro */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-3">
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">升级到专业版</h4>
                <p className="text-xs text-gray-600 mt-1">
                  获取无限查询、高级分析和优先支持。
                </p>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium mt-2">
              试用 Citea Pro →
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">免费计划</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition"
              title="登出"
            >
              <LogOut size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              研究助手
            </h1>
            <p className="text-gray-600">
              快速查找支持文章或验证引文真实性
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('finder')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'finder'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                查找文献
              </button>
              <button
                onClick={() => setActiveTab('checker')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'checker'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                验证引文
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'assistant'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                对话
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  BETA
                </span>
              </button>
            </div>

            {/* Main Input Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {activeTab === 'finder' && (
                <div className="p-6">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="输入您的研究查询..."
                    className="w-full h-64 p-4 border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
                    maxLength={300}
                  />
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {query.length}/300 字
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

              {activeTab === 'checker' && (
                <div className="p-6">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="粘贴包含引文的文本进行验证..."
                    className="w-full h-64 p-4 border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
                    maxLength={300}
                  />
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {query.length}/300 字
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

              {activeTab === 'assistant' && (
                <div className="p-6">
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="mx-auto mb-3" size={48} />
                      <p className="text-sm">开始对话...</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="输入您的问题..."
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

            {/* Example Prompts */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-yellow-500" size={18} />
                <span className="text-sm font-medium text-gray-700">示例：</span>
              </div>
              
              {activeTab === 'finder' && (
                <div className="space-y-2">
                  {examplePrompts.finder.map((prompt, index) => (
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
          </div>
        </div>
      </main>
    </div>
  )
}
