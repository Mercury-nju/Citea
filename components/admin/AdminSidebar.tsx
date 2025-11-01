'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  Activity
} from 'lucide-react'

const navItems = [
  {
    name: '数据概览',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: '行为分析',
    href: '/admin/analytics',
    icon: Activity,
  },
  {
    name: '付费管理',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    name: '数据报表',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    name: '系统设置',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] p-4">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-2">提示</p>
        <p className="text-xs text-gray-400">
          此后台系统完全独立于用户环境，不会影响用户正常使用。
        </p>
      </div>
    </aside>
  )
}

