'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export default function ProductShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const screenshots = [
    {
      title: '智能文献搜索',
      description: 'AI 驱动的文献查找，自动识别研究领域并推荐最相关的学术资源',
      image: '/screenshots/search-process.png',
      alt: 'Literature search interface showing AI-powered database selection'
    },
    {
      title: '搜索结果展示',
      description: '详细的文献信息，包括作者、期刊、DOI 链接和验证状态',
      image: '/screenshots/search-results.png',
      alt: 'Search results showing verified academic papers with metadata'
    },
    {
      title: '引用验证',
      description: '实时验证引用的真实性，标记可疑和无效的引用',
      image: '/screenshots/citation-checker.png',
      alt: 'Citation verification showing valid and invalid citations'
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            看看 Citea 如何工作
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            从搜索到验证，完整的学术研究工作流程
          </p>
        </div>

        {/* Screenshot Carousel */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main Screenshot */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
              {/* Placeholder for actual screenshot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {screenshots[currentSlide].title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {screenshots[currentSlide].description}
                  </p>
                  
                  {/* Mock Interface based on slide */}
                  {currentSlide === 0 && (
                    <div className="mt-8 max-w-2xl mx-auto">
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500 animate-spin border-4 border-blue-200 border-t-blue-600" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 text-left">
                              Literature Source Verification
                            </p>
                            <p className="text-xs text-gray-600 text-left">
                              Tracing and validating academic sources
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-green-200 rounded w-full" />
                          <div className="h-2 bg-blue-200 rounded w-3/4" />
                          <div className="h-2 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide === 1 && (
                    <div className="mt-8 max-w-2xl mx-auto">
                      <div className="bg-white rounded-xl p-6 shadow-lg text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                            ✓ CrossRef验证
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 mb-2">
                          Superconductivity at interfaces
                        </h3>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>👤 J C Inkson</p>
                          <p>📚 Journal of Physics C • 📅 1975</p>
                          <p className="text-blue-600">🔗 DOI: 10.1088/0022-3719/8/9/021</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSlide === 2 && (
                    <div className="mt-8 max-w-2xl mx-auto space-y-3">
                      <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500">
                        <p className="text-xs text-gray-700 mb-1">
                          Smith, J. (2020). Machine learning in healthcare...
                        </p>
                        <p className="text-xs font-bold text-green-700">✓ 已验证</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-red-500">
                        <p className="text-xs text-gray-700 mb-1">
                          Brown, A. (2023). Fake research paper...
                        </p>
                        <p className="text-xs font-bold text-red-700">✗ 未找到</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
            aria-label="Previous screenshot"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
            aria-label="Next screenshot"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to screenshot ${index + 1}`}
              />
            ))}
          </div>

          {/* Caption */}
          <div className="text-center mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {screenshots[currentSlide].title}
            </h3>
            <p className="text-gray-600">
              {screenshots[currentSlide].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

