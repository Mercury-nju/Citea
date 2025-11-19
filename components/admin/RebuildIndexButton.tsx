'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function RebuildIndexButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emails, setEmails] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleRebuild = async () => {
    setLoading(true)
    setSuccess(false)
    setError(null)
    setResult(null)

    try {
      // 如果提供了邮箱列表，使用提供的列表
      let body: any = {}
      if (emails.trim()) {
        const emailList = emails
          .split('\n')
          .map(e => e.trim())
          .filter(e => e.length > 0)
        body.emails = emailList
      }

      const res = await fetch('/api/admin/rebuild-index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || '重建索引失败')
        return
      }

      setSuccess(true)
      setResult(data)
      
      // 3秒后刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError('网络错误，请重试')
      console.error('Rebuild index error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    try {
      const res = await fetch('/api/admin/rebuild-index', {
        method: 'GET',
        credentials: 'include',
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('检查状态失败')
      console.error('Check status error:', err)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">重建用户索引</h2>
      <p className="text-sm text-gray-600 mb-4">
        如果管理员后台显示 0 个用户，但你知道有用户数据存在，可以使用此功能重建用户索引。
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            用户邮箱列表（可选，每行一个）
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="例如：&#10;user1@example.com&#10;user2@example.com&#10;user3@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            rows={5}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            如果留空，将尝试从现有索引重建。如果你知道用户的邮箱，可以输入来确保索引完整。
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRebuild}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                重建中...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                重建索引
              </>
            )}
          </button>

          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            检查状态
          </button>
        </div>

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-0.5" size={20} />
            <div>
              <p className="text-green-800 font-semibold">索引重建成功！</p>
              {result && (
                <p className="text-sm text-green-700 mt-1">
                  找到 {result.usersFound || result.validUsers || 0} 个用户
                </p>
              )}
              <p className="text-sm text-green-700 mt-1">页面将在 2 秒后自动刷新...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold">错误</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {result && !success && !error && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-semibold">索引状态</p>
            <pre className="text-xs text-blue-700 mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

