'use client'

import { Search, CheckCircle, MessageSquare, Play } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

export default function DetailedFeatures() {
  const { t } = useLanguage()

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">{t.detailedFeatures.title1}</span>
            <br />
            <span className="text-blue-600">
              {t.detailedFeatures.title2}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.detailedFeatures.subtitle}
          </p>
        </div>

        {/* Features Grid - 真实功能截图展示 */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Source Finder - 真实功能展示 */}
          <Link href="/auth/signin" className="group block">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-300">
              {/* 真实Dashboard截图预览 */}
              <div className="aspect-[16/10] bg-white relative overflow-hidden border-b border-gray-200">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  {/* 模拟真实界面截图 */}
                  <div className="w-full h-full flex flex-col">
                    {/* Input field */}
                    <div className="bg-white rounded border border-gray-300 p-3 mb-4">
                      <div className="h-8 bg-gray-50 rounded"></div>
                    </div>
                    {/* Results */}
                    <div className="flex-1 space-y-3">
                      <div className="bg-white rounded border border-gray-200 p-3">
                        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-50 rounded w-4/5"></div>
                      </div>
                      <div className="bg-white rounded border border-gray-200 p-3">
                        <div className="h-4 bg-gray-100 rounded w-5/6 mb-2"></div>
                        <div className="h-3 bg-gray-50 rounded w-3/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 功能说明 */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t.detailedFeatures.sourceFinder}</h3>
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold mt-1">
                      AI {t.detailedFeatures.aiPowered}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t.detailedFeatures.sourceFinderDesc}
                </p>
              </div>
            </div>
          </Link>

          {/* Citation Checker - 真实功能展示 */}
          <Link href="/auth/signin" className="group block">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-300">
              {/* 真实Dashboard截图预览 */}
              <div className="aspect-[16/10] bg-white relative overflow-hidden border-b border-gray-200">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  {/* 模拟真实界面截图 */}
                  <div className="w-full h-full flex flex-col">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 rounded border border-gray-200 p-3 text-center">
                        <div className="text-xl font-bold text-gray-900">2</div>
                        <div className="text-xs text-gray-600 mt-1">Verified</div>
                      </div>
                      <div className="bg-gray-50 rounded border border-gray-200 p-3 text-center">
                        <div className="text-xl font-bold text-gray-900">1</div>
                        <div className="text-xs text-gray-600 mt-1">Not Found</div>
                      </div>
                      <div className="bg-gray-50 rounded border border-gray-200 p-3 text-center">
                        <div className="text-xl font-bold text-gray-900">67%</div>
                        <div className="text-xs text-gray-600 mt-1">Score</div>
                      </div>
                    </div>
                    {/* Citations */}
                    <div className="flex-1 space-y-3">
                      <div className="bg-white rounded border-l-2 border-green-500 border border-gray-200 p-3">
                        <div className="h-4 bg-gray-50 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-50 rounded w-2/3"></div>
                      </div>
                      <div className="bg-white rounded border-l-2 border-red-500 border border-gray-200 p-3">
                        <div className="h-4 bg-gray-50 rounded w-5/6 mb-2"></div>
                        <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 功能说明 */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t.detailedFeatures.citationChecker}</h3>
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold mt-1">
                      {t.detailedFeatures.realTime}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t.detailedFeatures.citationCheckerDesc}
                </p>
              </div>
            </div>
          </Link>

          {/* AI Research Assistant - 真实功能展示 */}
          <Link href="/auth/signin" className="group block">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-300">
              {/* 真实Dashboard截图预览 */}
              <div className="aspect-[16/10] bg-white relative overflow-hidden border-b border-gray-200">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  {/* 模拟真实聊天界面截图 */}
                  <div className="w-full h-full flex flex-col">
                    {/* Input bar */}
                    <div className="bg-gray-100 rounded border border-gray-200 p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded border border-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                    {/* Messages */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-end">
                        <div className="bg-gray-900 rounded-lg rounded-tr-sm p-3 max-w-[70%]">
                          <div className="h-3 bg-gray-700 rounded w-full mb-1"></div>
                          <div className="h-3 bg-gray-700 rounded w-4/5"></div>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-lg rounded-tl-sm p-3 max-w-[75%]">
                          <div className="h-3 bg-gray-50 rounded w-full mb-1"></div>
                          <div className="h-3 bg-gray-50 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 功能说明 */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t.detailedFeatures.researchAssistant}</h3>
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold mt-1">
                      AI {t.detailedFeatures.aiPowered}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t.detailedFeatures.researchAssistantDesc}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

