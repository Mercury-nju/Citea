'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import { 
  FileText, 
  Search, 
  Plus, 
  LogOut,
  Sparkles,
  Edit3,
  CheckCircle,
  MessageSquare,
  Home as HomeIcon
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('citea_auth_token')
      
      if (!token) {
        router.push('/auth/signin')
        return
      }
      
      const savedUser = localStorage.getItem('citea_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (e) {
          console.error('Parse user error:', e)
        }
      }
      
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data = await res.json()
        
        if (data.user) {
          setUser(data.user)
          localStorage.setItem('citea_user', JSON.stringify(data.user))
        } else {
          localStorage.removeItem('citea_auth_token')
          localStorage.removeItem('citea_user')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('citea_auth_token')
        localStorage.removeItem('citea_user')
        router.push('/auth/signin')
      }
    }
    
    checkAuth()
  }, [router])

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

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    localStorage.removeItem('citea_auth_token')
    localStorage.removeItem('citea_user')
    router.push('/')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true
    if (path !== '/dashboard' && pathname.startsWith(path)) return true
    return false
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Check if it's write editor page (don't show sidebar)
  if (pathname.match(/\/dashboard\/write\/[^/]+$/)) {
    return <>{children}</>
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

        {/* User Info & Credits */}
        {user && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-900">{user.name || user.email}</p>
              <p className="text-xs text-gray-600 capitalize">{user.plan || 'free'} plan</p>
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-600">
                  {t.dashboard?.credits || 'Credits'}
                </span>
                {(user.plan === 'free' || !user.plan) && (
                  <a
                    href="/pricing"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t.dashboard?.upgrade || 'Upgrade'}
                  </a>
                )}
              </div>
              {/* Credits Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600">
                    {user.credits || 0} / {user.plan === 'free' ? '3' : user.plan === 'monthly' ? '150' : '3000'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.plan === 'free' ? 'Daily' : user.plan === 'monthly' ? 'Monthly' : 'Yearly'}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((user.credits || 0) / (user.plan === 'free' ? 3 : user.plan === 'monthly' ? 150 : 3000)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Document Button */}
        <div className="p-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            {t.dashboard?.newDocument || 'New Search'}
          </button>
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t.dashboard?.searchDocs || 'Search...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4">
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Tools
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => router.push('/dashboard')}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition group flex items-center gap-3 ${
                  isActive('/dashboard') && pathname === '/dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <HomeIcon size={18} />
                <span className="text-sm font-medium">Home</span>
              </button>
              
              <button
                onClick={() => router.push('/dashboard/write')}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition group flex items-center gap-3 ${
                  isActive('/dashboard/write')
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Edit3 size={18} />
                <span className="text-sm font-medium">Write</span>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard')
                  setTimeout(() => {
                    const event = new CustomEvent('setActiveTab', { detail: 'finder' })
                    window.dispatchEvent(event)
                  }, 100)
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition group flex items-center gap-3 text-gray-700"
              >
                <Search size={18} />
                <span className="text-sm font-medium">Find Sources</span>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard')
                  setTimeout(() => {
                    const event = new CustomEvent('setActiveTab', { detail: 'checker' })
                    window.dispatchEvent(event)
                  }, 100)
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition group flex items-center gap-3 text-gray-700"
              >
                <CheckCircle size={18} />
                <span className="text-sm font-medium">Verify Citations</span>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard')
                  setTimeout(() => {
                    const event = new CustomEvent('setActiveTab', { detail: 'assistant' })
                    window.dispatchEvent(event)
                  }, 100)
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition group flex items-center gap-3 text-gray-700"
              >
                <MessageSquare size={18} />
                <span className="text-sm font-medium">Chat Assistant</span>
              </button>
            </div>
          </div>

          {documents.length > 0 && (
            <div className="mb-2 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t.dashboard?.past7Days || 'Recent'}
              </h3>
              <div className="space-y-1">
                {documents.slice(0, 5).map((doc) => (
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
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Upgrade to Pro */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-3">
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{t.dashboard?.upgradeToPro || 'Upgrade'}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  {t.dashboard?.upgradeDesc || 'Get unlimited access'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/pricing')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium mt-2"
            >
              {t.dashboard?.tryPro || 'Try Pro'}
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
              <p className="text-xs text-gray-500">{user.plan || 'Free'} Plan</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition"
              title={t.dashboard?.logout || 'Logout'}
            >
              <LogOut size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

