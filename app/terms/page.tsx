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
            最后更新时间：2025年1月
          </p>
          
          <p className="text-gray-700 mb-6">
            欢迎使用 Citea（"服务"）。在使用 Citea 之前，请仔细阅读本服务条款（"条款"）。通过访问、使用或注册 Citea 服务，您同意受本条款约束。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. 接受条款</h2>
          <p className="text-gray-700 mb-4">
            通过访问、使用或注册 Citea 服务，您确认已阅读、理解并同意遵守本服务条款以及我们的隐私政策。如果您不同意这些条款，请勿使用我们的服务。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. 服务描述</h2>
          <p className="text-gray-700 mb-4">
            Citea 是一个 AI 驱动的学术研究辅助平台，提供以下功能：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li><strong>文献查找：</strong>从多个学术数据库（CrossRef、PubMed、arXiv、Semantic Scholar 等）查找可信来源</li>
            <li><strong>引用验证：</strong>检测虚假引用、AI 生成的引用和错误参考文献</li>
            <li><strong>AI 助手：</strong>提供研究建议、解释引用格式和学术诚信指导</li>
            <li><strong>引用格式支持：</strong>支持 APA、MLA、Chicago 等主流引用格式</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. 账户注册和责任</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 账户注册</h3>
          <p className="text-gray-700 mb-4">
            要使用某些功能，您需要注册账户。您同意：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>提供准确、完整和最新的信息</li>
            <li>维护并及时更新您的账户信息</li>
            <li>对账户下所有活动负责</li>
            <li>妥善保管账户凭证，不得与他人共享</li>
            <li>立即通知我们任何未经授权的使用</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 年龄要求</h3>
          <p className="text-gray-700 mb-4">
            您必须年满 13 岁才能使用 Citea 服务。如果您未满 18 岁，您需要获得父母或法定监护人的同意。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. 付费订阅</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 订阅计划</h3>
          <p className="text-gray-700 mb-4">
            Citea 提供免费和付费订阅计划。付费计划包括：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li><strong>月费计划：</strong>按月计费，可随时取消</li>
            <li><strong>年费计划：</strong>按年计费，享受折扣</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 付款和计费</h3>
          <p className="text-gray-700 mb-4">
            订阅费用通过第三方支付服务商（Creem）处理。您同意：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>提供有效的支付方式</li>
            <li>支付所有适用的订阅费用</li>
            <li>费用将在每个计费周期开始时自动扣除（除非您取消）</li>
            <li>价格如有变更，我们将在生效前通知您</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 自动续费</h3>
          <p className="text-gray-700 mb-4">
            订阅将自动续费，除非您在计费周期结束前取消。您可以在账户设置中随时取消自动续费。
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.4 退款政策</h3>
          <p className="text-gray-700 mb-4">
            由于订阅服务的性质，我们通常不提供退款。但以下情况可能例外：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>在订阅开始后 7 天内取消（首次订阅）</li>
            <li>因技术故障导致服务无法使用</li>
            <li>其他法律要求的情况</li>
          </ul>
          <p className="text-gray-700 mb-4">
            退款请求将根据具体情况逐案审查。请通过应用内支持联系我们。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. 使用限制和禁止行为</h2>
          <p className="text-gray-700 mb-4">您同意不得：</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>使用服务进行任何非法活动或违反适用法律法规</li>
            <li>试图破解、逆向工程或干扰服务的安全性或功能</li>
            <li>使用自动化工具（机器人、爬虫等）批量访问服务</li>
            <li>上传恶意代码、病毒或有害内容</li>
            <li>冒充他人或虚假陈述身份</li>
            <li>滥用服务导致系统过载或影响其他用户使用</li>
            <li>将服务用于商业转售或未经授权的商业用途</li>
            <li>删除或修改任何版权声明或专有标记</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. 知识产权</h2>
          <p className="text-gray-700 mb-4">
            Citea 服务及其所有内容（包括但不限于文本、图形、徽标、软件、界面设计）均受版权、商标和其他知识产权法保护。这些内容归 Citea 或其许可方所有。
          </p>
          <p className="text-gray-700 mb-4">
            您保留通过 Citea 生成或上传的内容的所有权，但授予我们使用、存储和处理这些内容的许可，以提供和改进服务。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. 服务可用性和中断</h2>
          <p className="text-gray-700 mb-4">
            我们努力保持服务的高可用性，但不保证：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>服务将始终可用、无中断或错误</li>
            <li>服务将满足您的特定需求</li>
            <li>任何错误将得到纠正</li>
          </ul>
          <p className="text-gray-700 mb-4">
            我们可能因维护、升级或其他原因暂停或中断服务，恕不另行通知。我们不对因此造成的任何损失负责。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. 第三方服务</h2>
          <p className="text-gray-700 mb-4">
            Citea 集成了多个第三方服务（如学术数据库、AI 服务、支付处理等）。这些服务受其各自的服务条款和隐私政策约束。我们不对第三方服务的内容、可用性或行为负责。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. 免责声明</h2>
          <p className="text-gray-700 mb-4">
            Citea 服务按"现状"提供，不提供任何明示或暗示的保证，包括但不限于：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>服务的准确性、完整性或可靠性</li>
            <li>服务将满足您的需求或期望</li>
            <li>服务将无中断、无错误或安全</li>
            <li>通过服务获得的任何结果或建议的准确性</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Citea 是研究辅助工具，不应替代您的专业判断。引用验证结果仅供参考，您应自行验证所有引用的准确性。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. 责任限制</h2>
          <p className="text-gray-700 mb-4">
            在法律允许的最大范围内，Citea 及其关联方不对以下情况承担责任：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>任何间接、偶然、特殊、后果性或惩罚性损害</li>
            <li>利润损失、数据丢失或业务中断</li>
            <li>因使用或无法使用服务而产生的任何损害</li>
          </ul>
          <p className="text-gray-700 mb-4">
            我们的总责任不超过您在提出索赔前的 12 个月内支付给我们的订阅费用总额。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. 账户终止</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">11.1 您终止账户</h3>
          <p className="text-gray-700 mb-4">
            您可以随时通过账户设置取消订阅或删除账户。取消订阅后，您将继续访问服务直到当前计费周期结束。
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">11.2 我们终止账户</h3>
          <p className="text-gray-700 mb-4">
            如果我们发现您违反本条款，我们保留立即暂停或终止您账户的权利，恕不另行通知。我们不对因此造成的任何损失负责。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. 服务变更</h2>
          <p className="text-gray-700 mb-4">
            我们保留随时修改、暂停或终止服务的权利，恕不另行通知。我们可能添加新功能或限制现有功能。重大变更将在网站上通知。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. 条款修改</h2>
          <p className="text-gray-700 mb-4">
            我们可能不时更新本服务条款。重大变更将在网站上显著通知。继续使用服务即表示您接受更新后的条款。如果您不同意修改后的条款，请停止使用服务。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. 争议解决</h2>
          <p className="text-gray-700 mb-4">
            因本条款引起的任何争议，双方应首先通过友好协商解决。如协商不成，争议应提交至有管辖权的法院解决。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. 可分割性</h2>
          <p className="text-gray-700 mb-4">
            如果本条款的任何条款被认定为无效或不可执行，该条款将被修改以使其可执行，其余条款仍保持完全有效。
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">16. 联系我们</h2>
          <p className="text-gray-700 mb-4">
            如果您对本服务条款有任何疑问，请通过以下方式联系我们：
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

