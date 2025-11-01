import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/adminAuth'
import UsersTable from '@/components/admin/UsersTable'

// 确保这是动态路由
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getAdminSession()
  
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-600 mt-2">查看和管理所有注册用户</p>
      </div>

      <UsersTable />
    </div>
  )
}

