'use client'

import { useState } from 'react'
import { Search, CheckCircle, MessageSquare, Lock, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

export default function ToolsPreview() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'finder' | 'checker' | 'assistant'>('finder')

  const tabs = [
    { id: 'finder' as const, label: t.tools.finder.tab, icon: Search },
    { id: 'checker' as const, label: t.tools.checker.tab, icon: CheckCircle },
    { id: 'assistant' as const, label: t.tools.assistant.tab, icon: MessageSquare },
  ]

  return (
    <section id="tools" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.tools.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.tools.subtitle}
          </p>
        </div>

        {/* Tools Demo */}
        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tool Preview Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Locked Overlay */}
            <div className="relative">
              {/* Blurred Content */}
              <div className="filter blur-sm pointer-events-none">
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {activeTab === 'finder' && t.tools.finder.title}
                      {activeTab === 'checker' && t.tools.checker.title}
                      {activeTab === 'assistant' && t.tools.assistant.title}
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === 'finder' && t.tools.finder.subtitle}
                      {activeTab === 'checker' && t.tools.checker.subtitle}
                      {activeTab === 'assistant' && t.tools.assistant.subtitle}
                    </p>
                  </div>

                  {/* Demo Input */}
                  {activeTab === 'finder' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        className="w-full p-4 border border-gray-300 rounded-xl"
                        placeholder={t.tools.finder.placeholder}
                        disabled
                      />
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold" disabled>
                        {t.tools.finder.search}
                      </button>
                    </div>
                  )}

                  {activeTab === 'checker' && (
                    <div className="space-y-4">
                      <textarea
                        className="w-full p-4 border border-gray-300 rounded-xl h-32"
                        placeholder={t.tools.checker.placeholder}
                        disabled
                      />
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold" disabled>
                        {t.tools.checker.verify}
                      </button>
                    </div>
                  )}

                  {activeTab === 'assistant' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4 h-64" />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 p-4 border border-gray-300 rounded-xl"
                          placeholder={t.tools.assistant.placeholder}
                          disabled
                        />
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold" disabled>
                          {t.tools.assistant.send}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lock Overlay */}
              <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Sign in to access tools
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create a free account to start using AI-powered citation verification and source finding tools
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/auth/signin"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      Sign In
                      <ArrowRight size={20} />
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="flex-1 bg-white text-gray-900 border-2 border-gray-200 px-6 py-3 rounded-xl hover:border-gray-300 hover:shadow-md transition-all font-semibold"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    ✨ No credit card required
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Search className="text-blue-600" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Unlimited Searches</h4>
              <p className="text-gray-600 text-sm">Find unlimited sources across all major academic databases</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Real-time Verification</h4>
              <p className="text-gray-600 text-sm">Instantly verify citations against authoritative sources</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                <MessageSquare className="text-amber-600" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">AI Assistant</h4>
              <p className="text-gray-600 text-sm">Get instant help with citation questions and research</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

