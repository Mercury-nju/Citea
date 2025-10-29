'use client'

import { Search, CheckCircle, MessageSquare, ArrowRight, ExternalLink, Copy, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

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

        {/* Features Grid - 更紧凑的3列布局 */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Source Finder */}
          <div className="group relative">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border-b border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Search className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t.detailedFeatures.sourceFinder}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <Sparkles size={10} />
                        {t.detailedFeatures.aiPowered}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <textarea
                    className="w-full text-xs text-gray-700 resize-none border-0 focus:ring-0 bg-transparent"
                    rows={3}
                    value="Bardeen-Cooper-Schrieffer theory..."
                    readOnly
                  />
                </div>

                {/* Results */}
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                          Superconductivity at interfaces
                        </h4>
                        <p className="text-xs text-gray-600">J C Inkson (1975)</p>
                        <span className="inline-block mt-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          CrossRef
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                          Cooper pairing in HTS
                        </h4>
                        <p className="text-xs text-gray-600">A. Smith (2018)</p>
                        <span className="inline-block mt-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                          PubMed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <Link
                  href="/auth/signin"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                >
                  {t.detailedFeatures.startSearching}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Citation Checker */}
          <div className="group relative">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Header */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 border-b border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t.detailedFeatures.citationChecker}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <CheckCircle size={10} />
                        {t.detailedFeatures.realTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-6 bg-gray-50">
                {/* Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 mb-2">
                    <span className="text-2xl font-bold text-red-600">67%</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">2/3 {t.detailedFeatures.verified}</p>
                </div>

                {/* Citation List */}
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="text-green-600" size={14} />
                      <span className="text-xs font-semibold text-green-700">{t.detailedFeatures.verified}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Smith, J. (2020). Research methods...
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border-l-4 border-red-500">
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink className="text-red-600" size={14} />
                      <span className="text-xs font-semibold text-red-700">{t.detailedFeatures.notFound}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Anonymous. MTV & Verizon...
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="text-green-600" size={14} />
                      <span className="text-xs font-semibold text-green-700">{t.detailedFeatures.verified}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Brown, A. (2023). Academic writing...
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <Link
                  href="/auth/signin"
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                >
                  {t.detailedFeatures.verifyCitations}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* AI Research Assistant */}
          <div className="group relative">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Header */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 border-b border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t.detailedFeatures.researchAssistant}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <Sparkles size={10} />
                        {t.detailedFeatures.aiPowered}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-6 bg-gray-50">
                <div className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                      <p className="text-xs">How can I verify this citation?</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                      <p className="text-xs text-gray-700 leading-relaxed mb-2">
                        I can help you verify that citation! Let me check it against academic databases...
                      </p>
                      <div className="flex gap-2">
                        <span className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                          CrossRef ✓
                        </span>
                        <span className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                          PubMed ✓
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
                      <p className="text-xs">What's the impact factor?</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                      <p className="text-xs text-gray-700">
                        The journal has an impact factor of 8.2 (2023)...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <Link
                  href="/auth/signin"
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-all text-sm font-semibold"
                >
                  {t.detailedFeatures.chatWithAI}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
