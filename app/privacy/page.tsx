import Link from 'next/link'
import Logo from '@/components/Logo'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-block mb-8">
          <Logo />
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">隐私政策</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            最后更新时间：2024年
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 信息收集</h2>
          <p className="text-gray-700 mb-4">
            我们收集您在使用 Citea 服务时提供的信息，包括但不限于邮箱地址、姓名等账户信息。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 信息使用</h2>
          <p className="text-gray-700 mb-4">
            我们使用收集的信息来提供、维护和改进我们的服务，以及处理您的请求。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 信息保护</h2>
          <p className="text-gray-700 mb-4">
            我们采取合理的安全措施来保护您的个人信息，防止未经授权的访问、使用或披露。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 联系我们</h2>
          <p className="text-gray-700 mb-4">
            如果您对本隐私政策有任何疑问，请通过应用内支持联系我们。
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

