'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 使用 cookie 认证（优先）或 Bearer token（兼容）
        const token = localStorage.getItem('citea_auth_token')
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        
        // 如果有 token，也添加到 header（兼容旧方式）
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // 获取统计信息
        const statsRes = await fetch('/api/admin/stats', {
          headers,
          credentials: 'include', // 包含 cookie
        })

        if (!statsRes.ok) {
          if (statsRes.status === 401) {
            // 未授权，重定向到登录页
            router.push('/admin/login')
            return
          } else if (statsRes.status === 403) {
            setError('您没有管理员权限')
          } else {
            setError('获取统计信息失败')
          }
          setLoading(false)
          return
        }

        const statsData = await statsRes.json()
        setStats(statsData)

        // 获取用户列表
        const usersRes = await fetch('/api/admin/users', {
          headers,
          credentials: 'include', // 包含 cookie
        })

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || [])
        } else if (usersRes.status === 401) {
          router.push('/admin/login')
          return
        }
      } catch (err) {
        console.error('Error fetching admin data:', err)
        setError('获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回 Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">管理员面板</h1>

        {/* 统计信息 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">总用户数</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">已验证邮箱</h3>
              <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">活跃订阅</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.withActiveSubscription}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">存储类型</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.storage}</p>
            </div>
          </div>
        )}

        {/* 按计划统计 */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">按计划统计</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">免费用户</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byPlan.free || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">周付用户</p>
                <p className="text-2xl font-bold text-blue-600">{stats.byPlan.weekly || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">月付用户</p>
                <p className="text-2xl font-bold text-purple-600">{stats.byPlan.monthly || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">年付用户</p>
                <p className="text-2xl font-bold text-green-600">{stats.byPlan.yearly || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">用户列表</h2>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">已验证</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">积分</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订阅状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.email}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.plan === 'free' ? 'bg-gray-100 text-gray-800' :
                          user.plan === 'weekly' ? 'bg-blue-100 text-blue-800' :
                          user.plan === 'monthly' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.emailVerified ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.credits || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.hasActiveSubscription ? (
                          <span className="text-green-600">活跃</span>
                        ) : user.subscriptionExpiresAt ? (
                          <span className="text-red-600">已过期</span>
                        ) : (
                          <span className="text-gray-400">无</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>暂无用户数据</p>
              <p className="text-sm mt-2">当有用户注册后，数据将显示在这里</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
          >
            返回 Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
