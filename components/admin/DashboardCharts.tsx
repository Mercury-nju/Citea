'use client'

import { useEffect, useState } from 'react'

export default function DashboardCharts() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 图表数据将在后续实现
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">用户增长趋势</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>图表功能开发中...</p>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">活跃度分析</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>图表功能开发中...</p>
        </div>
      </div>
    </div>
  )
}

