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
            最后更新时间：2025年1月
          </p>
          
          <p className="text-gray-700 mb-6">
            Citea（"我们"、"我们的"）致力于保护您的隐私。本隐私政策说明我们如何收集、使用、存储和保护您在使用 Citea 服务时提供的信息。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 我们收集的信息</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.1 账户信息</h3>
          <p className="text-gray-700 mb-4">
            当您注册账户时，我们收集以下信息：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>邮箱地址（用于账户验证和通信）</li>
            <li>姓名（可选）</li>
            <li>密码（加密存储）</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.2 使用数据</h3>
          <p className="text-gray-700 mb-4">
            我们自动收集以下技术信息：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>IP 地址和浏览器类型</li>
            <li>访问时间、使用功能和页面浏览记录</li>
            <li>设备信息（操作系统、设备类型）</li>
            <li>搜索查询和引用验证记录</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.3 支付信息</h3>
          <p className="text-gray-700 mb-4">
            当您订阅付费服务时，支付处理由第三方服务商（Creem）处理。我们不会存储您的完整支付卡号或银行账户信息。我们仅收集：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>订阅状态和套餐类型</li>
            <li>交易记录（用于账户管理）</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 信息使用目的</h2>
          <p className="text-gray-700 mb-4">我们使用收集的信息用于以下目的：</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>提供、维护和改进 Citea 服务</li>
            <li>处理您的账户注册、验证和登录</li>
            <li>管理订阅和计费</li>
            <li>发送服务通知和重要更新</li>
            <li>分析使用模式以优化用户体验</li>
            <li>检测和防止欺诈、滥用或安全威胁</li>
            <li>遵守法律法规要求</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 信息共享和披露</h2>
          <p className="text-gray-700 mb-4">我们不会出售您的个人信息。我们仅在以下情况下共享信息：</p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 服务提供商</h3>
          <p className="text-gray-700 mb-4">
            我们与以下第三方服务商共享必要信息以提供服务：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li><strong>支付处理：</strong>Creem（处理订阅支付）</li>
            <li><strong>AI 服务：</strong>通义千问（用于生成内容和对话）</li>
            <li><strong>数据库服务：</strong>CrossRef、PubMed、arXiv、Semantic Scholar（用于文献查找）</li>
            <li><strong>云服务：</strong>Vercel（托管和部署）</li>
            <li><strong>存储：</strong>Vercel KV 或 Redis（数据存储）</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 法律要求</h3>
          <p className="text-gray-700 mb-4">
            在法律要求或为保护我们的权利、财产或安全时，我们可能披露信息。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 数据安全</h2>
          <p className="text-gray-700 mb-4">
            我们采取行业标准的安全措施保护您的数据：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>使用 HTTPS 加密传输</li>
            <li>密码使用安全哈希算法存储</li>
            <li>定期安全审计和漏洞扫描</li>
            <li>访问控制和权限管理</li>
            <li>数据备份和灾难恢复计划</li>
          </ul>
          <p className="text-gray-700 mb-4">
            尽管我们采取合理措施，但无法保证绝对安全。请妥善保管您的账户凭证。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Cookie 和跟踪技术</h2>
          <p className="text-gray-700 mb-4">
            我们使用 Cookie 和类似技术来：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>维护您的登录状态</li>
            <li>记住您的语言偏好</li>
            <li>分析网站使用情况</li>
          </ul>
          <p className="text-gray-700 mb-4">
            您可以通过浏览器设置管理 Cookie，但禁用 Cookie 可能影响部分功能。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. 您的权利</h2>
          <p className="text-gray-700 mb-4">您对自己的个人信息享有以下权利：</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li><strong>访问权：</strong>查看我们持有的您的个人信息</li>
            <li><strong>更正权：</strong>更新或更正您的账户信息</li>
            <li><strong>删除权：</strong>请求删除您的账户和个人数据</li>
            <li><strong>数据可携权：</strong>以结构化格式导出您的数据</li>
            <li><strong>撤回同意：</strong>随时撤回对数据处理的同意</li>
          </ul>
          <p className="text-gray-700 mb-4">
            要行使这些权利，请通过应用内支持或发送邮件联系我们。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. 数据保留</h2>
          <p className="text-gray-700 mb-4">
            我们仅在提供服务所需期间保留您的数据。账户注销后，我们将在合理期限内删除您的个人信息，但可能保留部分匿名化数据用于统计和分析。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 跨境数据传输</h2>
          <p className="text-gray-700 mb-4">
            您的数据可能被传输到并存储在我们运营所在国家/地区以外的服务器上。我们确保通过适当的法律机制（如标准合同条款）保护您的数据。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. 儿童隐私</h2>
          <p className="text-gray-700 mb-4">
            Citea 服务面向 13 岁及以上用户。我们不会故意收集 13 岁以下儿童的个人信息。如发现此类情况，我们将立即删除相关数据。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. 隐私政策更新</h2>
          <p className="text-gray-700 mb-4">
            我们可能不时更新本隐私政策。重大变更将在网站上显著通知。继续使用服务即表示您接受更新后的政策。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. 联系我们</h2>
          <p className="text-gray-700 mb-4">
            如果您对本隐私政策有任何疑问、意见或请求，请通过以下方式联系我们：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>应用内支持功能</li>
            <li>发送邮件至支持邮箱（如适用）</li>
          </ul>
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

