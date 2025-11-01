import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { getAdminSession } from '@/lib/adminAuth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 检查管理员认证
  const session = await getAdminSession()
  
  if (!session) {
    redirect('/admin/login')
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

