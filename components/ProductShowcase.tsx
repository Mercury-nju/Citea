'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function ProductShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: '文献查找',
      description: 'AI 驱动的智能搜索，自动识别研究领域',
      component: <FinderScreenshot />
    },
    {
      title: '引用验证',
      description: '实时验证引用真实性，确保学术诚信',
      component: <CheckerScreenshot />
    },
    {
      title: 'AI 助手',
      description: '专业的学术写作指导和引用建议',
      component: <AssistantScreenshot />
    }
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6 border border-blue-100">
            <Sparkles className="text-blue-600" size={18} />
            <span className="text-sm font-semibold text-blue-900">产品演示</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            看看 Citea 如何工作
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            从搜索到验证，完整的学术研究工作流程
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Screenshot Display */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-8">
            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
              {slides[currentSlide].component}
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-gray-200"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-gray-200"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-3 mt-8">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all ${
                  index === currentSlide
                    ? 'bg-blue-600 w-12 h-3 rounded-full'
                    : 'bg-gray-300 hover:bg-gray-400 w-3 h-3 rounded-full'
                }`}
              />
            ))}
          </div>

          {/* Caption */}
          <div className="text-center mt-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {slides[currentSlide].title}
            </h3>
            <p className="text-gray-600">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Real Dashboard Screenshots Components with Enhanced Details
function FinderScreenshot() {
  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Mock Browser Top Bar */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-500">
          citea.app/source-finder
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5 mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🔍</span>
          </div>
          <span className="font-bold text-gray-900">Source Finder</span>
        </div>
        <textarea
          readOnly
          value="Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs through phonon interactions. However, high-temperature superconductors, such as cuprates and iron-based compounds, cannot be fully explained by this model."
          className="w-full h-24 text-sm text-gray-700 resize-none border-0 focus:outline-none leading-relaxed"
        />
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
          <div className="flex gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">235 characters</span>
            <span className="text-xs text-blue-600 font-medium">✓ Ready to search</span>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all">
            🚀 Search Sources
          </button>
        </div>
      </div>

      {/* Results with more details */}
      <div className="space-y-3 flex-1 overflow-hidden">
        <div className="text-xs font-semibold text-gray-500 mb-2">Found 12 results in 0.8s</div>
        
        <div className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-md hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">✓ Verified • CrossRef</span>
            <span className="text-xs text-gray-500">98% match</span>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1.5 leading-tight">Superconductivity at interfaces between conventional and unconventional superconductors</h4>
          <p className="text-xs text-gray-600 mb-2">👤 J C Inkson • 📚 Journal of Physics C: Solid State Physics • 📅 1975</p>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">DOI: 10.1088/0022-3719/8/13/021</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">1,247 citations</span>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-md hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">✓ Verified • PubMed</span>
            <span className="text-xs text-gray-500">95% match</span>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1.5 leading-tight">Cooper pairing in condensed matter systems</h4>
          <p className="text-xs text-gray-600 mb-2">👤 A. Smith, B. Johnson, C. Lee • 📚 Physical Review B • 📅 2018</p>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">PMID: 29845632</span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Impact: 8.2</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">✓ arXiv</span>
            <span className="text-xs text-gray-500">89% match</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">High-temperature superconductivity mechanisms...</h4>
          <p className="text-xs text-gray-600">👤 Multiple authors • 📚 arXiv preprint • 📅 2023</p>
        </div>
      </div>
    </div>
  )
}

function CheckerScreenshot() {
  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Mock Browser Top Bar */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-500">
          citea.app/citation-checker
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">2</div>
          <div className="text-xs text-green-700 font-medium">Verified</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">1</div>
          <div className="text-xs text-red-700 font-medium">Not Found</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">67%</div>
          <div className="text-xs text-blue-700 font-medium">Accuracy</div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-3 overflow-hidden">
        {/* Valid Citation 1 */}
        <div className="border-l-4 border-green-500 bg-white rounded-r-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                Smith, J., & Johnson, M. (2020). Machine learning in healthcare. <em>Nature Medicine</em>, 26(5), 123-130.
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">✓ Verified</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">CrossRef</span>
              </div>
              <p className="text-xs text-green-600 mt-2">DOI: 10.1038/s41591-020-0001-x • Citations: 1,456</p>
            </div>
          </div>
        </div>

        {/* Invalid Citation */}
        <div className="border-l-4 border-red-500 bg-white rounded-r-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                Brown, A. (2023). Fake research paper. <em>Journal of Made Up Studies</em>, 15(3), 45-67.
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">✗ Not Found</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Fake</span>
              </div>
              <p className="text-xs text-red-600 mt-2">⚠️ Unable to verify in any academic database</p>
            </div>
          </div>
        </div>

        {/* Valid Citation 2 */}
        <div className="border-l-4 border-green-500 bg-white rounded-r-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                Lee, K. (2019). Academic writing best practices...
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">✓ Verified</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">PubMed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssistantScreenshot() {
  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Mock Browser Top Bar */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-500">
          citea.app/ai-assistant
        </div>
      </div>

      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="text-white font-bold">AI Research Assistant</h3>
            <p className="text-purple-200 text-xs">Online • Ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-hidden mb-4">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[75%] shadow-md">
            <p className="text-sm">How do I cite a journal article with multiple authors in APA format?</p>
          </div>
        </div>

        {/* AI Response with Rich Content */}
        <div className="flex justify-start">
          <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[85%] shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-sm font-bold text-gray-900">Citea Assistant</span>
              <span className="ml-auto text-xs text-gray-400">Just now</span>
            </div>
            <p className="text-sm text-gray-800 mb-3 leading-relaxed">
              For APA format with multiple authors:
            </p>
            <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-100">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>1-2 authors:</strong> List all names</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>3-20 authors:</strong> List all names</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>21+ authors:</strong> First 19 + "..." + last author</span>
                </li>
              </ul>
            </div>
            <div className="pt-3 border-t border-gray-200 bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 font-medium mb-1">Example:</p>
              <p className="text-xs text-gray-700 italic">
                Smith, J., Johnson, M., & Williams, K. (2023). Research methods. <em>Journal Name</em>, 15(2), 123-145.
              </p>
            </div>
          </div>
        </div>

        {/* User Follow-up */}
        <div className="flex justify-end">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[70%] shadow-md">
            <p className="text-sm">Can you verify this citation for me?</p>
          </div>
        </div>

        {/* AI Typing Indicator */}
        <div className="flex justify-start">
          <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-xs text-gray-500">AI is typing...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask me anything about citations..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm bg-white focus:border-purple-500 transition-colors"
          readOnly
        />
        <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all">
          <span className="text-xl">📤</span>
        </button>
      </div>
    </div>
  )
}
