import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { getAdminSession } from '@/lib/adminAuth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 检查管理员认证（登录页面会自行处理，这里只保护其他页面）
  const session = await getAdminSession()
  
  // 如果没有 session，让子页面自己处理（login 页面会显示，其他页面会重定向）
  if (!session) {
    // 返回 children，让子页面自己处理重定向
    // login 页面会显示，其他页面会被各自的页面组件重定向
    return <>{children}</>
  }

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

