'use client'

import { useState } from 'react'
import { Search, CheckCircle, MessageSquare, Sparkles, ExternalLink, Copy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

export default function ToolsShowcase() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'finder' | 'checker' | 'assistant'>('finder')

  const tabs = [
    { id: 'finder' as const, label: t.tools.finder.tab, icon: Search },
    { id: 'checker' as const, label: t.tools.checker.tab, icon: CheckCircle },
    { id: 'assistant' as const, label: t.tools.assistant.tab, icon: MessageSquare },
  ]

  return (
    <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t.tools.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.tools.subtitle}
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
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.tools.showcase.finderTitle}</h3>
                
                {/* Example Query */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Neural network-based models have been applied to predict protein folding structures with accuracy comparable to experimental methods.
                  </p>
                </div>

                {/* Processing Steps Visual */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-white" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{t.tools.showcase.literatureVerification}</p>
                      <p className="text-xs text-gray-600">{t.tools.showcase.literatureVerificationDesc}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Search className="text-white" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{t.tools.showcase.scanningDatabases}</p>
                      <p className="text-xs text-gray-600">{t.tools.showcase.scanningDatabasesDesc}</p>
                    </div>
                  </div>
                </div>

                {/* Result Example */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                      <CheckCircle size={12} />
                      {t.tools.showcase.crossrefVerified}
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
                  {t.tools.showcase.startFinding}
                  <Sparkles size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Citation Checker Demo */}
          {activeTab === 'checker' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.tools.showcase.checkerTitle}</h3>
                
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
                        <p className="text-xs font-semibold text-green-700">{t.tools.showcase.verified}</p>
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
                        <p className="text-xs font-semibold text-red-700">{t.tools.showcase.notFound}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/auth/signin"
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  {t.tools.showcase.verifyNow}
                  <CheckCircle size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* AI Assistant Demo */}
          {activeTab === 'assistant' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {t.tools.showcase.assistantTitle}
                  <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-bold">{t.tools.showcase.beta}</span>
                </h3>
                
                {/* Chat Example */}
                <div className="space-y-3 mb-6">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
                      <p className="text-sm">{t.tools.showcase.exampleQuestion}</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {t.tools.showcase.exampleAnswer}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-700">
                        <li>{t.tools.showcase.exampleRule1}</li>
                        <li>{t.tools.showcase.exampleRule2}</li>
                        <li>{t.tools.showcase.exampleRule3}</li>
                      </ul>
                      <p className="mt-2 text-xs text-gray-600 italic">
                        {t.lang === 'zh' ? '例如：' : 'Example: '}Smith, J., Johnson, M., & Williams, K. (2023). Title. Journal, 15(3), 123-130.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/auth/signin"
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  {t.tools.showcase.startChat}
                  <MessageSquare size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <Search className="text-blue-600" size={20} />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">{t.tools.showcase.feature1Title}</h4>
              <p className="text-xs text-gray-600">{t.tools.showcase.feature1Desc}</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                <CheckCircle className="text-purple-600" size={20} />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">{t.tools.showcase.feature2Title}</h4>
              <p className="text-xs text-gray-600">{t.tools.showcase.feature2Desc}</p>
            </div>
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                <MessageSquare className="text-amber-600" size={20} />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">{t.tools.showcase.feature3Title}</h4>
              <p className="text-xs text-gray-600">{t.tools.showcase.feature3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

