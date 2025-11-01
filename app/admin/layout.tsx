import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { getAdminSession } from '@/lib/adminAuth'

// 确保这是动态路由
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 获取管理员会话（不在这里做重定向，让各个页面自己处理）
  const session = await getAdminSession()

  // 如果已登录，显示完整布局
  if (session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader user={session} />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // 如果未登录，直接显示子页面（登录页面会显示自己的布局，其他页面会重定向）
  return <>{children}</>
}

