'use client'

import { Search, CheckCircle, MessageSquare, Play } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

export default function DetailedFeatures() {
  const { t } = useLanguage()

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">{t.detailedFeatures.title1}</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300">
              {/* 真实Dashboard截图预览 */}
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* 模拟真实界面截图 */}
                  <div className="w-full h-full p-4">
                    <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
                      <div className="h-16 bg-gray-100 rounded border border-gray-200"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg border-2 border-blue-300 p-2">
                        <div className="h-3 bg-blue-100 rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-2">
                        <div className="h-3 bg-green-100 rounded w-2/3 mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 播放图标覆盖层 */}
                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
                    <Play className="text-white ml-1" size={24} fill="white" />
                  </div>
                </div>
              </div>

              {/* 功能说明 */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Search className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t.detailedFeatures.sourceFinder}</h3>
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold mt-1">
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
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-red-300 transition-all duration-300">
              {/* 真实Dashboard截图预览 */}
              <div className="aspect-[4/3] bg-gradient-to-br from-red-50 to-red-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* 模拟真实界面截图 */}
                  <div className="w-full h-full p-4">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white rounded-lg p-2 text-center border border-green-200">
                        <div className="text-lg font-bold text-green-600">2</div>
                        <div className="text-[8px] text-gray-600">Verified</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-red-200">
                        <div className="text-lg font-bold text-red-600">1</div>
                        <div className="text-[8px] text-gray-600">Not Found</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-blue-200">
                        <div className="text-lg font-bold text-blue-600">67%</div>
                        <div className="text-[8px] text-gray-600">Score</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg border-l-4 border-green-500 p-2">
                        <div className="h-2 bg-green-100 rounded w-3/4 mb-1"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-1/2"></div>
                      </div>
                      <div className="bg-white rounded-lg border-l-4 border-red-500 p-2">
                        <div className="h-2 bg-red-100 rounded w-2/3 mb-1"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 播放图标覆盖层 */}
                <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                    <Play className="text-white ml-1" size={24} fill="white" />
                  </div>
                </div>
              </div>

              {/* 功能说明 */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t.detailedFeatures.citationChecker}</h3>
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-semibold mt-1">
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
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-purple-300 transition-all duration-300">
              {/* 真实Dashboard截图预览 */}
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* 模拟真实聊天界面截图 */}
                  <div className="w-full h-full p-4 flex flex-col">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-2 bg-purple-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-blue-600 rounded-lg rounded-tr-sm p-2 max-w-[75%]">
                          <div className="h-2 bg-blue-400 rounded w-full"></div>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white border-2 border-gray-200 rounded-lg rounded-tl-sm p-2 max-w-[80%]">
                          <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 播放图标覆盖层 */}
                <div className="absolute inset-0 bg-purple-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <Play className="text-white ml-1" size={24} fill="white" />
                  </div>
                </div>
              </div>

              {/* 功能说明 */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t.detailedFeatures.researchAssistant}</h3>
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold mt-1">
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
