'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mail, Calendar, CheckCircle, XCircle, Search } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  plan: string
  createdAt: string
  lastLoginAt?: string
  emailVerified: boolean
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setError(null)
      console.log('[UsersTable] Fetching users from /api/admin/users...')
      const res = await fetch('/api/admin/users', {
        credentials: 'include', // 包含 cookie
      })
      console.log('[UsersTable] Response status:', res.status, res.statusText)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[UsersTable] Failed to fetch users:', res.status, res.statusText, errorData)
        setError(`获取用户失败: ${res.status} ${res.statusText}`)
        return
      }
      
      const data = await res.json()
      console.log('[UsersTable] Received data:', {
        total: data.total,
        usersCount: data.users?.length || 0,
        storage: data.storage,
        stats: data.stats
      })
      
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users)
        console.log(`[UsersTable] Set ${data.users.length} users`)
      } else {
        console.warn('[UsersTable] No users array in response:', data)
        setUsers([])
      }
    } catch (error) {
      console.error('[UsersTable] Failed to fetch users:', error)
      setError('获取用户数据失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">用户列表</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-6">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            重试
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                计划
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                注册时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最后登录
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? '未找到匹配的用户' : '暂无用户'}
                  {!searchTerm && !loading && (
                    <div className="mt-4 text-sm text-gray-400">
                      <p>可能的原因：</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>数据库中没有用户数据</li>
                        <li>Redis 连接失败</li>
                        <li>数据读取错误</li>
                      </ul>
                      <p className="mt-4">请检查浏览器控制台和 Vercel 日志获取更多信息</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name || '未设置'}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail size={14} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.plan === 'free' 
                        ? 'bg-gray-100 text-gray-800'
                        : user.plan === 'pro'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.plan === 'free' ? '免费' : user.plan === 'pro' ? '专业版' : '高级版'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.emailVerified ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-sm">已验证</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <XCircle size={16} />
                        <span className="text-sm">未验证</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLoginAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(user.lastLoginAt).toLocaleDateString('zh-CN')}
                      </div>
                    ) : (
                      <span className="text-gray-400">从未登录</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-gray-900 hover:text-gray-700"
                    >
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          共 <span className="font-semibold">{filteredUsers.length}</span> 个用户
        </p>
      </div>
    </div>
  )
}

