'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 动态导入功能组件（避免SSR问题）
const SourceFinderDemo = dynamic(() => import('./demos/SourceFinderDemo'), { ssr: false })
const CitationCheckerDemo = dynamic(() => import('./demos/CitationCheckerDemo'), { ssr: false })
const AIAssistantDemo = dynamic(() => import('./demos/AIAssistantDemo'), { ssr: false })

export default function ProductShowcase() {
  const [currentTab, setCurrentTab] = useState<'finder' | 'checker' | 'assistant'>('finder')

  const demos = {
    finder: {
      title: '文献查找',
      description: 'AI 驱动的智能搜索，从学术数据库中自动查找相关文献',
    },
    checker: {
      title: '引用验证',
      description: '实时验证引用真实性，识别虚假文献，确保学术诚信',
    },
    assistant: {
      title: 'AI 研究助手',
      description: '智能对话助手，回答学术问题，提供引用建议',
    }
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-blue-400/30">
            <Sparkles className="text-blue-300" size={18} />
            <span className="text-sm font-semibold text-white">产品演示</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            看看 Citea 如何工作
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
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
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20'
                }`}
              >
                {demos[tab].title}
              </button>
            ))}
          </div>

          {/* Live Demo Container */}
          <div className="relative">
            {/* Main Demo Display */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200 bg-white">
              {/* Browser Chrome */}
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-300 font-mono">
                  citea.app/{currentTab === 'finder' ? 'source-finder' : currentTab === 'checker' ? 'citation-checker' : 'ai-assistant'}
                </div>
                <div className="text-gray-400 text-xs">🔒 安全</div>
              </div>

              {/* Live Demo Content */}
              <div className="relative bg-gradient-to-br from-gray-50 to-white" style={{ minHeight: '600px' }}>
                {currentTab === 'finder' && <SourceFinderDemo />}
                {currentTab === 'checker' && <CitationCheckerDemo />}
                {currentTab === 'assistant' && <AIAssistantDemo />}
                
                {/* Overlay with CTA */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none flex items-end justify-center pb-8">
                  <Link 
                    href="/auth/signin"
                    className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-2xl transform hover:scale-105 transition-all"
                  >
                    🚀 开始使用完整功能
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl -z-10 opacity-50"></div>
          </div>

          {/* Description */}
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              {demos[currentTab].title}
            </h3>
            <p className="text-blue-200 text-lg max-w-3xl mx-auto mb-6">
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
