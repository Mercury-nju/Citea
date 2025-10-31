'use client'

import { useState } from 'react'
import { Search, Sparkles, CheckCircle } from 'lucide-react'

export default function SourceFinderDemo() {
  const [isSearching, setIsSearching] = useState(false)

  const handleDemo = () => {
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 3000)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
          <Sparkles className="text-blue-600" size={20} />
          <span className="text-sm font-semibold text-blue-900">AI 文献查找</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">智能搜索学术文献</h2>
        <p className="text-gray-600">粘贴你的研究内容，AI 自动为你查找相关文献</p>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <Search className="text-blue-600" size={24} />
          <span className="font-bold text-gray-900 text-lg">输入研究内容</span>
        </div>
        <textarea
          readOnly
          value="Bardeen-Cooper-Schrieffer (BCS) theory describes how electrons form Cooper pairs through phonon interactions, leading to superconductivity. However, high-temperature superconductors like cuprates cannot be fully explained by this conventional model."
          className="w-full h-32 text-gray-700 resize-none border-0 focus:outline-none leading-relaxed bg-gray-50 rounded-lg p-4"
        />
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">📝 235 字符</span>
            <span className="text-sm text-green-600 font-medium">✓ 准备就绪</span>
          </div>
          <button 
            onClick={handleDemo}
            disabled={isSearching}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all ${
              isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:scale-105'
            }`}
          >
            {isSearching ? '🔍 搜索中...' : '🚀 开始搜索'}
          </button>
        </div>
      </div>

      {/* Results Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">搜索结果</h3>
          <span className="text-sm text-gray-500">找到 12 条结果 • 用时 0.8s</span>
        </div>

        {/* Result Card 1 */}
        <div className={`bg-white border-2 border-blue-200 rounded-xl p-5 shadow-md transition-all ${
          isSearching ? 'animate-pulse' : 'hover:shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-blue-600" size={20} fill="currentColor" />
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                ✓ 已验证 • CrossRef
              </span>
            </div>
            <span className="text-sm text-green-600 font-semibold">98% 匹配</span>
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
            Superconductivity at interfaces between conventional and unconventional superconductors
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            👤 J C Inkson • 📚 Journal of Physics C: Solid State Physics • 📅 1975
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">DOI: 10.1088/0022-3719/8/13/021</span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">📊 1,247 引用</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">⭐ 高影响力</span>
          </div>
        </div>

        {/* Result Card 2 */}
        <div className={`bg-white border-2 border-green-200 rounded-xl p-5 shadow-md transition-all ${
          isSearching ? 'animate-pulse opacity-70' : 'hover:shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} fill="currentColor" />
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                ✓ 已验证 • PubMed
              </span>
            </div>
            <span className="text-sm text-green-600 font-semibold">95% 匹配</span>
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
            Cooper pairing mechanisms in condensed matter systems
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            👤 A. Smith, B. Johnson, C. Lee • 📚 Physical Review B • 📅 2018
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">PMID: 29845632</span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">📈 影响因子: 8.2</span>
          </div>
        </div>

        {/* Result Card 3 - Partial */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">✓ arXiv</span>
            <span className="text-sm text-gray-500">89% 匹配</span>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">
            High-temperature superconductivity mechanisms...
          </h4>
          <p className="text-sm text-gray-600">👤 Multiple authors • 📅 2023</p>
        </div>
      </div>
    </div>
  )
}

