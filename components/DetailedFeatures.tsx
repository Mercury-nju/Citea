'use client'

import { Search, CheckCircle, MessageSquare } from 'lucide-react'

export default function DetailedFeatures() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need for reliable research.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive citation verification and source validation tools to ensure your academic work meets the highest standards.
          </p>
        </div>

        {/* Source Finder */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="order-2 md:order-1">
            <div className="relative">
              {/* Floating card with shadow */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform hover:scale-105 transition-transform duration-300">
                {/* Search Input */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-4 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs...
                    </p>
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Search size={20} />
                    Search Literature
                  </button>
                </div>
                
                {/* Results */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-600 rounded-r-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-900">CrossRef</span>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold mb-1">Superconductivity at interfaces</p>
                    <p className="text-xs text-gray-600">J C Inkson • 1975</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100/50 border-l-4 border-green-600 rounded-r-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-xs font-bold text-green-900">PubMed</span>
                    </div>
                    <p className="text-sm text-gray-900 font-semibold mb-1">Cooper pairing in condensed matter</p>
                    <p className="text-xs text-gray-600">A. Smith et al. • 2018</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl" />
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
              <Search className="text-white" size={32} />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Source Finder</h3>
            <p className="text-xl text-gray-700 font-medium mb-4">
              Find credible academic sources for your research topics automatically.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Advanced search algorithms help you discover relevant, peer-reviewed sources from trusted academic databases, saving hours of manual research.
            </p>
          </div>
        </div>

        {/* Citation Checker */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="order-1">
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="space-y-4">
                  {/* Valid Citation */}
                  <div className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white rounded-r-2xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                          Smith, J., & Johnson, M. (2020). Machine learning in healthcare. <em>Nature Medicine</em>, 26(5), 123-130.
                        </p>
                        <p className="text-xs font-bold text-green-700 mb-1">✓ Verified - Found in CrossRef database</p>
                        <p className="text-xs text-green-600">DOI: 10.1038/s41591-020-0001-x</p>
                      </div>
                    </div>
                  </div>

                  {/* Invalid Citation */}
                  <div className="border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-white rounded-r-2xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white text-lg font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                          Brown, A. (2023). Fake research paper. <em>Journal of Made Up Studies</em>, 15(3), 45-67.
                        </p>
                        <p className="text-xs font-bold text-red-700 mb-1">✗ Not Found - Possibly fabricated citation</p>
                        <p className="text-xs text-red-600">⚠️ Could not verify in any academic database</p>
                      </div>
                    </div>
                  </div>

                  {/* Checking */}
                  <div className="border-l-4 border-gray-300 bg-gradient-to-r from-gray-50 to-white rounded-r-2xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-gray-600 flex items-center justify-center flex-shrink-0 animate-spin" />
                      <div className="flex-1 pt-2">
                        <p className="text-sm text-gray-600 italic">Checking citation...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-100 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-3xl" />
            </div>
          </div>
          
          <div className="order-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 shadow-lg">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Citation Checker</h3>
            <p className="text-xl text-gray-700 font-medium mb-4">
              Instantly verify the authenticity of academic references and citations.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our AI-powered system cross-references citations against authoritative academic databases to ensure every source is legitimate and properly attributed.
            </p>
          </div>
        </div>

        {/* Research Assistant */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="space-y-4 mb-6">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl px-5 py-3 max-w-[80%] shadow-lg">
                      <p className="text-sm">如何引用一篇有多个作者的期刊文章？</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl px-5 py-4 max-w-[85%] border border-gray-200 shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <MessageSquare size={14} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-900">AI Assistant</span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed mb-3">
                        在APA格式中，对于有多个作者的期刊文章：
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700 mb-3">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>1-2位作者：列出所有作者</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>3-20位作者：列出所有</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>21位以上：前19位 + "..." + 最后一位</span>
                        </li>
                      </ul>
                      <div className="pt-3 border-t border-gray-300">
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
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors bg-gray-50"
                    readOnly
                  />
                  <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-100 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-3xl" />
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <MessageSquare className="text-white" size={32} />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Research Assistant</h3>
            <p className="text-xl text-gray-700 font-medium mb-4">
              AI-powered chat assistant for citation verification and source analysis.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Ask questions about your references, verify citation details, and get real-time guidance on source authenticity. Our AI assistant helps you maintain academic integrity throughout your research process.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
