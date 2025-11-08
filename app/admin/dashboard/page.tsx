import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/adminAuth'
import DashboardStats from '@/components/admin/DashboardStats'
import DashboardCharts from '@/components/admin/DashboardCharts'
import RebuildIndexButton from '@/components/admin/RebuildIndexButton'

// 确保这是动态路由
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">数据概览</h1>
        <p className="text-gray-600 mt-2">实时查看 Citea 平台的关键指标</p>
      </div>

      <DashboardStats />
      
      {/* 如果数据为 0，显示重建索引按钮 */}
      <RebuildIndexButton />
      
      <DashboardCharts />
    </div>
  )
}

