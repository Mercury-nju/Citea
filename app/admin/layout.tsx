import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { getAdminSession } from '@/lib/adminAuth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  // 尝试从 middleware 设置的 header 获取路径名
  let pathname = headersList.get('x-pathname') || ''
  
  // 如果 header 中没有路径名，尝试从 referer 或其他 header 获取
  if (!pathname) {
    const referer = headersList.get('referer') || ''
    const url = headersList.get('x-url') || ''
    // 尝试从 URL 中提取路径
    try {
      if (url) {
        pathname = new URL(url).pathname
      } else if (referer) {
        pathname = new URL(referer).pathname
      }
    } catch {
      // 如果解析失败，使用空字符串
    }
  }
  
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/'
  
  // 检查管理员认证
  const session = await getAdminSession()
  
  // 登录页面：如果有 session 则重定向，否则显示登录页
  if (isLoginPage) {
    if (session) {
      redirect('/admin/dashboard')
    }
    // 登录页面使用自己的全屏样式，不需要布局
    return <>{children}</>
  }
  
  // 其他页面：必须有 session，否则重定向到登录页
  if (!session) {
    redirect('/admin/login')
  }

  // 显示完整的管理后台布局
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

