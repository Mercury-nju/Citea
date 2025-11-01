import Link from 'next/link'
import Logo from '@/components/Logo'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-block mb-8">
          <Logo />
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">服务条款</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最后更新时间：2024年
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 接受条款</h2>
          <p className="text-gray-700 mb-4">
            通过访问或使用 Citea 服务，您同意遵守本服务条款。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 服务描述</h2>
          <p className="text-gray-700 mb-4">
            Citea 是一个学术研究辅助工具，帮助用户查找文献、检查引用和获取研究建议。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 用户责任</h2>
          <p className="text-gray-700 mb-4">
            您有责任确保您使用服务的所有活动都符合适用法律法规。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 服务变更</h2>
          <p className="text-gray-700 mb-4">
            我们保留随时修改或终止服务的权利，恕不另行通知。
          </p>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}

