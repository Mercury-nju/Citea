'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function ProductShowcase() {
  const [currentTab, setCurrentTab] = useState<'finder' | 'checker' | 'assistant'>('finder')

  const demos = {
    finder: {
      title: '文献查找',
      description: 'AI 驱动的智能搜索，从学术数据库中自动查找相关文献',
      screenshot: '/screenshots/source-finder.png'
    },
    checker: {
      title: '引用验证',
      description: '实时验证引用真实性，识别虚假文献，确保学术诚信',
      screenshot: '/screenshots/citation-checker.png'
    },
    assistant: {
      title: 'AI 研究助手',
      description: '智能对话助手，回答学术问题，提供引用建议',
      screenshot: '/screenshots/ai-assistant.png'
    }
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6 border border-blue-100">
            <Sparkles className="text-blue-600" size={18} />
            <span className="text-sm font-semibold text-blue-900">产品演示</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            看看 Citea 如何工作
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            真实的操作界面，完整的学术研究工作流程
          </p>
        </div>

        {/* Screenshot Display */}
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center gap-3 mb-8">
            {(['finder', 'checker', 'assistant'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentTab === tab
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {demos[tab].title}
              </button>
            ))}
          </div>

          {/* Screenshot Container */}
          <div className="relative group">
            {/* Main Screenshot */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200 bg-white">
              <div className="relative aspect-video bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                {/* Placeholder - 等待真实截图 */}
                <div className="text-center p-12">
                  <div className="text-6xl mb-6">
                    {currentTab === 'finder' && '🔍'}
                    {currentTab === 'checker' && '✅'}
                    {currentTab === 'assistant' && '🤖'}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {demos[currentTab].title}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    {demos[currentTab].description}
                  </p>
                  <div className="inline-block bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-3">
                    <p className="text-sm text-blue-800 font-medium">
                      💡 真实截图准备中...
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      点击下方"开始使用"体验完整功能
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Hover Overlay */}
              <Link 
                href="/auth/signin"
                className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                <div className="transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <div className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-2xl">
                    🚀 立即体验
                  </div>
                </div>
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl -z-10 opacity-50"></div>
          </div>

          {/* Description */}
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {demos[currentTab].title}
            </h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
              {demos[currentTab].description}
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              <span>开始使用</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
