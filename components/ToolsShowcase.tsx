'use client'

import { useState } from 'react'
import { Search, CheckCircle, MessageSquare, Sparkles, ExternalLink, Copy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

export default function ToolsShowcase() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'finder' | 'checker' | 'assistant'>('finder')

  const tabs = [
    { id: 'finder' as const, label: '文献查找', icon: Search },
    { id: 'checker' as const, label: '引用验证', icon: CheckCircle },
    { id: 'assistant' as const, label: 'AI 助手', icon: MessageSquare },
  ]

  return (
    <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            立即开始验证引用
          </h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            准备好确保您研究中的每个引用都是真实的了吗？现在开始使用 Citea 的强大工具。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto">
          {/* Source Finder Demo */}
          {activeTab === 'finder' && (
            <div className="bg-white rounded-xl border border-white/30 shadow-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">AI 文献查找器</h3>
                
                {/* Example Query */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs through phonon interactions. However, high-temperature superconductors, such as cuprates and iron-based compounds, cannot be fully explained by this model.
                  </p>
                </div>

                {/* Processing Steps Visual */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-white" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Literature Source Verification</p>
                      <p className="text-xs text-gray-600">Tracing and validating academic sources</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Search className="text-white" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Scanning academic databases</p>
                      <p className="text-xs text-gray-600">Connecting to PubMed, CrossRef, and ArXiv</p>
                    </div>
                  </div>
                </div>

                {/* Result Example */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                      <CheckCircle size={12} />
                      CrossRef验证
                    </span>
                    <div className="ml-auto flex gap-1.5">
                      <button className="p-1.5 hover:bg-gray-200 rounded transition">
                        <ExternalLink size={14} className="text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded transition">
                        <Copy size={14} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    Superconductivity at interfaces
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>👤 J C Inkson</p>
                    <p>📚 Journal of Physics C: Solid State Physics • 📅 1975</p>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/auth/signin"
                  className="mt-6 w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  开始查找文献
                  <Sparkles size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Citation Checker Demo */}
          {activeTab === 'checker' && (
            <div className="bg-white rounded-xl border border-white/30 shadow-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">引用验证工具</h3>
                
                {/* Example Citations */}
                <div className="space-y-4 mb-6">
                  {/* Valid Citation */}
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="text-white" size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-2">
                          Smith, J., & Johnson, M. (2020). Machine learning in healthcare. Nature Medicine, 26(5), 123-130.
                        </p>
                        <p className="text-xs font-semibold text-green-700">✓ 已验证 - 在 CrossRef 数据库中找到</p>
                      </div>
                    </div>
                  </div>

                  {/* Suspicious Citation */}
                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-2">
                          Brown, A. (2023). Fake research paper. Journal of Made Up Studies, 15(3), 45-67.
                        </p>
                        <p className="text-xs font-semibold text-red-700">✗ 未找到 - 可能是伪造的引用</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/auth/signin"
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  验证您的引用
                  <CheckCircle size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* AI Assistant Demo */}
          {activeTab === 'assistant' && (
            <div className="bg-white rounded-xl border border-white/30 shadow-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  AI 研究助手
                  <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-bold">BETA</span>
                </h3>
                
                {/* Chat Example */}
                <div className="space-y-3 mb-6">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
                      <p className="text-sm">如何引用一篇有多个作者的期刊文章？</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        在APA格式中，对于有多个作者的期刊文章：
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-700">
                        <li>• 1-2位作者：列出所有作者</li>
                        <li>• 3-20位作者：列出所有作者</li>
                        <li>• 21位或以上：列出前19位，然后用"..."，最后列出最后一位</li>
                      </ul>
                      <p className="mt-2 text-xs text-gray-600 italic">
                        例如：Smith, J., Johnson, M., & Williams, K. (2023). Title. Journal, 15(3), 123-130.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/auth/signin"
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  开始对话
                  <MessageSquare size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <Search className="text-blue-300" size={20} />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">无限次引用检查</h4>
              <p className="text-xs text-blue-200">在所有主要学术数据库中查找无限来源</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <CheckCircle className="text-purple-300" size={20} />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">实时验证</h4>
              <p className="text-xs text-blue-200">即时验证权威来源的引用</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
                <MessageSquare className="text-amber-300" size={20} />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">AI 研究助手对话</h4>
              <p className="text-xs text-blue-200">获得有关引用问题和研究的即时帮助</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

