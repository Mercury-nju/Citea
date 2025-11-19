'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import { 
  FileText, 
  Search, 
  LogOut,
  Sparkles,
  CheckCircle,
  MessageSquare,
  Home as HomeIcon,
  Trash2
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
      // 首先检查 URL 参数中是否有来自 Google OAuth 的 token 和 user
      const searchParams = new URLSearchParams(window.location.search)
      const urlToken = searchParams.get('token')
      const urlUser = searchParams.get('user')
      
      if (urlToken && urlUser) {
        // 保存到 localStorage
        localStorage.setItem('citea_auth_token', urlToken)
        localStorage.setItem('citea_user', urlUser)
        // 清除 URL 参数
        window.history.replaceState({}, '', pathname)
      }
      
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
          // 确保包含所有必要的字段
          const fullUserData = {
            ...data.user,
            subscriptionExpiresAt: data.user.subscriptionExpiresAt || null,
            subscriptionStartDate: data.user.subscriptionStartDate || null,
            subscriptionEndDate: data.user.subscriptionEndDate || null,
            credits: data.user.credits || 0,
            plan: data.user.plan || 'free'
          }
          setUser(fullUserData)
          localStorage.setItem('citea_user', JSON.stringify(fullUserData))
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

  const loadDocuments = useCallback(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`citea_search_history_${user.email}`)
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory)
          // Filter to show only past 7 days
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          const recentHistory = history.filter((doc: any) => {
            // 优先使用 timestamp，如果没有则尝试解析 date
            if (doc.timestamp && typeof doc.timestamp === 'number') {
              return doc.timestamp >= sevenDaysAgo
            }
            // 如果 date 是字符串，尝试解析，但需要更健壮的处理
            if (doc.date) {
              try {
                const parsedDate = new Date(doc.date).getTime()
                // 检查是否是有效日期
                if (!isNaN(parsedDate)) {
                  return parsedDate >= sevenDaysAgo
                }
              } catch (e) {
                // 如果解析失败，默认保留该记录（可能是旧格式）
                return true
              }
            }
            // 如果既没有 timestamp 也没有有效的 date，默认保留
            return true
          })
          setDocuments(recentHistory)
        } catch (e) {
          console.error('Failed to load search history:', e)
          setDocuments([])
        }
      } else {
        setDocuments([])
      }
    }
  }, [user])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const handleDeleteDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation() // 防止触发父元素的点击事件
    if (!user) return

    try {
      const savedHistory = localStorage.getItem(`citea_search_history_${user.email}`)
      if (savedHistory) {
        const history = JSON.parse(savedHistory)
        const updated = history.filter((doc: any) => doc.id !== docId)
        localStorage.setItem(`citea_search_history_${user.email}`, JSON.stringify(updated))
        loadDocuments() // 重新加载文档列表
      }
    } catch (e) {
      console.error('Failed to delete document:', e)
    }
  }

  // 定期刷新用户数据（每30秒），确保支付后权益能及时显示
  useEffect(() => {
    if (!user) return

    const refreshUserData = async () => {
      try {
        const token = localStorage.getItem('citea_auth_token')
        if (!token) return

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await res.json()
        if (data.user) {
          const fullUserData = {
            ...data.user,
            subscriptionExpiresAt: data.user.subscriptionExpiresAt || null,
            subscriptionStartDate: data.user.subscriptionStartDate || null,
            subscriptionEndDate: data.user.subscriptionEndDate || null,
            credits: data.user.credits || 0,
            plan: data.user.plan || 'free'
          }
          
          // 只有当 plan 或 credits 发生变化时才更新
          if (fullUserData.plan !== user.plan || fullUserData.credits !== user.credits) {
            console.log('[Dashboard] User data updated:', { 
              oldPlan: user.plan, 
              newPlan: fullUserData.plan,
              oldCredits: user.credits,
              newCredits: fullUserData.credits
            })
            setUser(fullUserData)
            localStorage.setItem('citea_user', JSON.stringify(fullUserData))
          }
        }
      } catch (error) {
        console.error('Error refreshing user data:', error)
      }
    }

    // 立即刷新一次（支付成功后）
    refreshUserData()

    // 每30秒刷新一次
    const interval = setInterval(refreshUserData, 30000)

    return () => clearInterval(interval)
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
              <p className="text-sm font-semibold text-gray-900">
                {user.name && user.name !== 'test user' ? user.name : user.email || 'User'}
              </p>
              <p className="text-xs text-gray-600 capitalize">{user.plan || 'free'} plan</p>
            </div>
            
            {/* Subscription Time Progress Bar - Only for paid users */}
            {(user.plan === 'monthly' || user.plan === 'yearly' || user.plan === 'Monthly' || user.plan === 'Yearly') && user.subscriptionExpiresAt && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600">
                    {t.dashboard?.subscriptionTime || 'Subscription'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-green-600">
                      {(() => {
                        const expiresAt = new Date(user.subscriptionExpiresAt).getTime()
                        const now = Date.now()
                        const diff = expiresAt - now
                        if (diff <= 0) return 'Expired'
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                        return days > 0 ? `${days}d ${hours}h` : `${hours}h`
                      })()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const expiresAt = new Date(user.subscriptionExpiresAt).getTime()
                        const now = Date.now()
                        const diff = expiresAt - now
                        if (diff <= 0) return 'Expired'
                        const totalDays = user.plan === 'monthly' || user.plan === 'Monthly' ? 30 : 365
                        const remainingDays = Math.floor(diff / (1000 * 60 * 60 * 24))
                        return `${remainingDays} / ${totalDays} days`
                      })()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${(() => {
                          const expiresAt = new Date(user.subscriptionExpiresAt).getTime()
                          const now = Date.now()
                          const diff = expiresAt - now
                          if (diff <= 0) return 0
                          const totalDays = user.plan === 'monthly' || user.plan === 'Monthly' ? 30 : 365
                          const remainingDays = Math.floor(diff / (1000 * 60 * 60 * 24))
                          return Math.min(100, (remainingDays / totalDays) * 100)
                        })()}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
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
                  <div
                    key={doc.id}
                    className="w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 transition group flex items-start gap-2"
                  >
                    <button
                      onClick={() => {
                        if (doc.type === 'write' && doc.docId) {
                          router.push(`/dashboard/write/${doc.docId}`)
                        } else if (doc.type === 'finder') {
                          router.push('/dashboard?tab=finder')
                          setTimeout(() => {
                            const event = new CustomEvent('setActiveTab', { detail: 'finder' })
                            window.dispatchEvent(event)
                          }, 100)
                        } else if (doc.type === 'checker') {
                          router.push('/dashboard?tab=checker')
                          setTimeout(() => {
                            const event = new CustomEvent('setActiveTab', { detail: 'checker' })
                            window.dispatchEvent(event)
                          }, 100)
                        }
                      }}
                      className="flex-1 text-left flex items-start gap-2 min-w-0"
                    >
                      <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {doc.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500">{doc.date}</p>
                          {doc.type === 'finder' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {t.dashboard?.historyFinder}
                            </span>
                          )}
                          {doc.type === 'checker' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                              {t.dashboard?.historyChecker}
                            </span>
                          )}
                          {doc.type === 'write' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                              {t.dashboard?.historyWrite}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title={t.dashboard?.delete || 'Delete'}
                    >
                      <Trash2 size={14} className="text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Upgrade to Pro - Only show for free users */}
        {user && (user.plan === 'free' || !user.plan || user.plan === 'Free') && (
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
          </div>
        )}

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name && user.name !== 'test user' ? user.name : user.email || 'User'}
              </p>
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

