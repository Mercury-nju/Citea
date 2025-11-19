'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, Activity, CreditCard, TrendingUp, Clock } from 'lucide-react'

interface Stats {
  totalUsers: number
  newUsersToday: number
  activeUsersToday: number
  activeUsersThisMonth: number
  paidUsers: number
  retentionRate: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    // 每 30 秒刷新一次
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats', {
        credentials: 'include', // 包含 cookie
      })
      if (!res.ok) {
        console.error('Failed to fetch stats:', res.status, res.statusText)
        return
      }
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: '总用户数',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
      change: null,
    },
    {
      title: '今日新注册',
      value: stats?.newUsersToday || 0,
      icon: UserPlus,
      color: 'green',
      change: null,
    },
    {
      title: '今日活跃用户',
      value: stats?.activeUsersToday || 0,
      icon: Activity,
      color: 'purple',
      change: null,
    },
    {
      title: '本月活跃用户',
      value: stats?.activeUsersThisMonth || 0,
      icon: TrendingUp,
      color: 'orange',
      change: null,
    },
    {
      title: '付费用户',
      value: stats?.paidUsers || 0,
      icon: CreditCard,
      color: 'pink',
      change: null,
    },
    {
      title: '留存率',
      value: `${(stats?.retentionRate || 0).toFixed(1)}%`,
      icon: Clock,
      color: 'indigo',
      change: null,
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const colorClass = colorClasses[stat.color as keyof typeof colorClasses]

        return (
          <div key={stat.title} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon size={24} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}

