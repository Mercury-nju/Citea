import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/adminAuth'

export default async function AdminPage() {
  const session = await getAdminSession()
  
  if (session) {
    redirect('/admin/dashboard')
  } else {
    redirect('/admin/login')
  }
}

// 确保这是动态路由
export const dynamic = 'force-dynamic'

