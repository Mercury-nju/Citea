'use client'

import { useState } from 'react'
import { Shield, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'

export default function CitationCheckerDemo() {
  const [isChecking, setIsChecking] = useState(false)

  const handleDemo = () => {
    setIsChecking(true)
    setTimeout(() => setIsChecking(false), 3000)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
          <Shield className="text-green-600" size={20} />
          <span className="text-sm font-semibold text-green-900">引用验证系统</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">实时验证引用真实性</h2>
        <p className="text-gray-600">粘贴文献引用，AI 自动验证其真实性和准确性</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center transition-all ${
          isChecking ? 'animate-pulse' : ''
        }`}>
          <div className="text-3xl font-bold text-green-600 mb-1">2</div>
          <div className="text-sm text-green-700 font-medium">✓ 验证通过</div>
        </div>
        <div className={`bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center transition-all ${
          isChecking ? 'animate-pulse' : ''
        }`}>
          <div className="text-3xl font-bold text-red-600 mb-1">1</div>
          <div className="text-sm text-red-700 font-medium">✗ 未找到</div>
        </div>
        <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center transition-all ${
          isChecking ? 'animate-pulse' : ''
        }`}>
          <div className="text-3xl font-bold text-blue-600 mb-1">67%</div>
          <div className="text-sm text-blue-700 font-medium">准确率</div>
        </div>
      </div>

      {/* Check Button */}
      <div className="mb-6 text-center">
        <button 
          onClick={handleDemo}
          disabled={isChecking}
          className={`bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all ${
            isChecking ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'
          }`}
        >
          {isChecking ? '🔍 验证中...' : '🚀 开始验证引用'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">验证结果</h3>

        {/* Valid Citation 1 */}
        <div className="border-l-4 border-green-500 bg-white rounded-r-xl p-5 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-3 leading-relaxed font-medium">
                Smith, J., & Johnson, M. (2020). Machine learning in healthcare. <em>Nature Medicine</em>, 26(5), 123-130.
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  ✓ 真实引用
                </span>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                  CrossRef 数据库
                </span>
                <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                  匹配度: 98%
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                <span>📄 DOI: 10.1038/s41591-020-0001-x</span>
                <span>📊 被引: 1,456 次</span>
                <span>⭐ 高影响力期刊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invalid Citation */}
        <div className="border-l-4 border-red-500 bg-white rounded-r-xl p-5 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-3 leading-relaxed font-medium">
                Brown, A. (2023). Fake research paper. <em>Journal of Made Up Studies</em>, 15(3), 45-67.
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                  ✗ 可疑引用
                </span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  未找到记录
                </span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-red-700 font-medium">
                  ⚠️ 警告：无法在任何学术数据库中验证此引用。可能是虚假或不存在的文献。
                </p>
                <ul className="text-xs text-red-600 mt-2 ml-4 space-y-1">
                  <li>• 期刊名称未在数据库中注册</li>
                  <li>• 作者信息无法核实</li>
                  <li>• 缺少有效的 DOI 或 PMID</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Valid Citation 2 */}
        <div className="border-l-4 border-green-500 bg-white rounded-r-xl p-5 shadow-md opacity-90">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-3 leading-relaxed font-medium">
                Lee, K. (2019). Academic writing best practices. <em>Journal of Education</em>, 45(2), 201-215.
              </p>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  ✓ 真实引用
                </span>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                  PubMed 数据库
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">AI 智能验证</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              我们的 AI 系统会自动检查：CrossRef、PubMed、arXiv、Semantic Scholar 等主流学术数据库，
              验证作者、标题、期刊、日期等关键信息的准确性。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

