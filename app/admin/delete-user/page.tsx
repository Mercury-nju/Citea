'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function DeleteUserPage() {
  const [email, setEmail] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [showList, setShowList] = useState(false)

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, adminKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || '删除失败')
        setIsLoading(false)
        return
      }

      if (data.success) {
        setMessage(`✅ ${data.message}: ${data.email}`)
        setEmail('')
      } else {
        setError(data.message || '用户不存在')
      }
    } catch (err) {
      setError('删除失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleListUsers = async () => {
    if (!adminKey) {
      setError('请输入管理员密钥')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch(`/api/admin/delete-user?adminKey=${encodeURIComponent(adminKey)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '获取用户列表失败')
        setIsLoading(false)
        return
      }

      setUsers(data.users || [])
      setShowList(true)
      setMessage(`找到 ${data.count} 个用户`)
    } catch (err) {
      setError('获取用户列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickDelete = async (userEmail: string) => {
    if (!confirm(`确定要删除用户 ${userEmail} 吗？`)) {
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, adminKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '删除失败')
        setIsLoading(false)
        return
      }

      setMessage(`✅ ${data.message}: ${data.email}`)
      // 刷新列表
      handleListUsers()
    } catch (err) {
      setError('删除失败')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <Logo />
        </Link>

        {/* Admin Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            🛠️ 用户管理
          </h1>
          <p className="text-gray-600 mb-6 text-center text-sm">
            ⚠️ 仅用于测试环境 - 删除测试账号
          </p>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Admin Key */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              管理员密钥
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              placeholder="输入管理员密钥"
            />
            <p className="mt-1 text-xs text-gray-500">
              默认密钥: delete-test-users-2025 (可在 .env 中设置 ADMIN_KEY)
            </p>
          </div>

          {/* List Users Button */}
          <button
            onClick={handleListUsers}
            disabled={isLoading || !adminKey}
            className="w-full mb-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '加载中...' : '📋 列出所有用户'}
          </button>

          {/* User List */}
          {showList && users.length > 0 && (
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">用户列表</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {users.map((user, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-600">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.emailVerified ? '✅ 已验证' : '❌ 未验证'} • {new Date(user.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleQuickDelete(user.email)}
                      disabled={isLoading}
                      className="ml-4 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm font-medium disabled:opacity-50"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showList && users.length === 0 && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
              没有找到任何用户
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">或手动删除</span>
            </div>
          </div>

          {/* Delete Form */}
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                要删除的邮箱
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="user@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !adminKey}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '删除中...' : '🗑️ 删除用户'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ 注意：</strong>
              <br />
              • 删除操作不可恢复
              <br />
              • 仅用于删除测试账号
              <br />
              • 生产环境请禁用此功能或使用更安全的验证方式
            </p>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

