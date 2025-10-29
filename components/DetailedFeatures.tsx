'use client'

import { Search, CheckCircle, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DetailedFeatures() {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Everything you need for reliable research.
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive citation verification and source validation tools to ensure your academic work meets the highest standards.
          </p>
        </div>

        {/* Source Finder */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              {/* Mock Search Interface */}
              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-700">
                    Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs...
                  </p>
                </div>
                <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
                  <Search size={18} />
                  Search Literature
                </button>
              </div>
              {/* Mock Results */}
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">✓</span>
                    <span className="text-xs font-bold text-gray-900">CrossRef</span>
                  </div>
                  <p className="text-xs text-gray-700 font-semibold">Superconductivity at interfaces</p>
                  <p className="text-xs text-gray-600">J C Inkson • 1975</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">✓</span>
                    <span className="text-xs font-bold text-gray-900">PubMed</span>
                  </div>
                  <p className="text-xs text-gray-700 font-semibold">Cooper pairing in condensed matter</p>
                  <p className="text-xs text-gray-600">A. Smith et al. • 2018</p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <Search className="w-16 h-16 text-blue-600 mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Source Finder</h3>
            <p className="text-lg text-gray-700 font-semibold mb-2">
              Find credible academic sources for your research topics automatically.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Advanced search algorithms help you discover relevant, peer-reviewed sources from trusted academic databases, saving hours of manual research.
            </p>
          </div>
        </div>

        {/* Citation Checker */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              {/* Mock Citation Checker */}
              <div className="space-y-3">
                {/* Valid Citation */}
                <div className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 mb-1">
                        Smith, J., & Johnson, M. (2020). Machine learning in healthcare. <em>Nature Medicine</em>, 26(5), 123-130.
                      </p>
                      <p className="text-xs font-bold text-green-700">✓ Verified - Found in CrossRef database</p>
                      <p className="text-xs text-green-600 mt-1">DOI: 10.1038/s41591-020-0001-x</p>
                    </div>
                  </div>
                </div>

                {/* Invalid Citation */}
                <div className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 mb-1">
                        Brown, A. (2023). Fake research paper. <em>Journal of Made Up Studies</em>, 15(3), 45-67.
                      </p>
                      <p className="text-xs font-bold text-red-700">✗ Not Found - Possibly fabricated citation</p>
                      <p className="text-xs text-red-600 mt-1">⚠️ Could not verify in any academic database</p>
                    </div>
                  </div>
                </div>

                {/* Pending Check */}
                <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 italic">
                        Checking citation...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-2">
            <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Citation Checker</h3>
            <p className="text-lg text-gray-700 font-semibold mb-2">
              Instantly verify the authenticity of academic references and citations.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our AI-powered system cross-references citations against authoritative academic databases to ensure every source is legitimate and properly attributed.
            </p>
          </div>
        </div>

        {/* Research Assistant */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              {/* Mock Chat Interface */}
              <div className="space-y-3 mb-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">如何引用一篇有多个作者的期刊文章？</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[85%]">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-purple-600" />
                      <span className="text-xs font-bold text-gray-700">AI Assistant</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed mb-2">
                      在APA格式中，对于有多个作者的期刊文章：
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700 ml-4">
                      <li>• 1-2位作者：列出所有作者</li>
                      <li>• 3-20位作者：列出所有</li>
                      <li>• 21位以上：前19位 + "..." + 最后一位</li>
                    </ul>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 italic">
                        例如：Smith, J., Johnson, M., & Williams, K. (2023).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  readOnly
                />
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <MessageSquare className="w-16 h-16 text-purple-600 mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Research Assistant</h3>
            <p className="text-lg text-gray-700 font-semibold mb-2">
              AI-powered chat assistant for citation verification and source analysis.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Ask questions about your references, verify citation details, and get real-time guidance on source authenticity. Our AI assistant helps you maintain academic integrity throughout your research process.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
