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

// Real Dashboard Screenshots Components
function FinderScreenshot() {
  return (
    <div className="w-full h-full p-8 bg-white flex flex-col">
      {/* Search Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <textarea
          readOnly
          value="Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs through phonon interactions. However, high-temperature superconductors, such as cuprates and iron-based compounds, cannot be fully explained by this model."
          className="w-full h-32 text-sm text-gray-700 resize-none border-0 focus:outline-none"
        />
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
          <span className="text-xs text-gray-500">235/300 字</span>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
            搜索文献
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3 flex-1 overflow-hidden">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-bold">✓ CrossRef验证</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">Superconductivity at interfaces</h4>
          <p className="text-xs text-gray-600">👤 J C Inkson • 📚 Journal of Physics C • 📅 1975</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded font-bold">✓ PubMed验证</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">Cooper pairing in condensed matter systems</h4>
          <p className="text-xs text-gray-600">👤 A. Smith et al. • 📚 Physical Review • 📅 2018</p>
        </div>
      </div>
    </div>
  )
}

function CheckerScreenshot() {
  return (
    <div className="w-full h-full p-8 bg-white flex flex-col gap-4">
      {/* Valid */}
      <div className="border-l-4 border-green-500 bg-green-50 rounded-r-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">✓</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 mb-2">
              Smith, J., & Johnson, M. (2020). Machine learning in healthcare. <em>Nature Medicine</em>, 26(5), 123-130.
            </p>
            <p className="text-xs font-bold text-green-700">✓ 已验证 - 在 CrossRef 数据库中找到</p>
            <p className="text-xs text-green-600 mt-1">DOI: 10.1038/s41591-020-0001-x</p>
          </div>
        </div>
      </div>

      {/* Invalid */}
      <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">!</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 mb-2">
              Brown, A. (2023). Fake research paper. <em>Journal of Made Up Studies</em>, 15(3), 45-67.
            </p>
            <p className="text-xs font-bold text-red-700">✗ 未找到 - 可能是伪造的引用</p>
            <p className="text-xs text-red-600 mt-1">⚠️ 无法在任何学术数据库中验证</p>
          </div>
        </div>
      </div>

      {/* Checking */}
      <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <div className="flex-1 pt-1">
            <p className="text-sm text-gray-600 italic">正在验证引用...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssistantScreenshot() {
  return (
    <div className="w-full h-full p-8 bg-white flex flex-col">
      <div className="flex-1 space-y-4 mb-4">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 max-w-[70%]">
            <p className="text-sm">如何引用一篇有多个作者的期刊文章？</p>
          </div>
        </div>

        {/* AI Response */}
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl px-5 py-4 max-w-[80%]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">AI</span>
              </div>
              <span className="text-xs font-bold text-gray-900">AI Assistant</span>
            </div>
            <p className="text-sm text-gray-800 mb-3">在APA格式中，对于有多个作者的期刊文章：</p>
            <ul className="space-y-2 text-sm text-gray-700 mb-3">
              <li className="flex gap-2"><span className="text-purple-600">•</span><span>1-2位作者：列出所有作者</span></li>
              <li className="flex gap-2"><span className="text-purple-600">•</span><span>3-20位作者：列出所有作者</span></li>
              <li className="flex gap-2"><span className="text-purple-600">•</span><span>21位或以上：前19位 + "..." + 最后一位</span></li>
            </ul>
            <div className="pt-3 border-t border-gray-300">
              <p className="text-xs text-gray-600 italic">
                例如：Smith, J., Johnson, M., & Williams, K. (2023).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask a question..."
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50"
          readOnly
        />
        <button className="bg-purple-600 text-white px-5 py-3 rounded-xl">
          <span className="text-lg">💬</span>
        </button>
      </div>
    </div>
  )
}
