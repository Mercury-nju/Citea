'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle, Search, Loader2 } from 'lucide-react'

export default function ProductShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const slides = [
    {
      title: 'AI 文献查找器',
      subtitle: '智能分析，精准推荐',
      badge: '搜索中',
      color: 'blue'
    },
    {
      title: '引用验证系统',
      subtitle: '实时验证，确保真实',
      badge: '验证中',
      color: 'green'
    },
    {
      title: '研究助手',
      subtitle: 'AI 对话，专业指导',
      badge: 'AI 助手',
      color: 'purple'
    }
  ]

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      light: 'from-blue-50 to-blue-100',
      border: 'border-blue-500',
      text: 'text-blue-600',
      bg: 'bg-blue-600'
    },
    green: {
      gradient: 'from-green-500 via-green-600 to-green-700',
      light: 'from-green-50 to-green-100',
      border: 'border-green-500',
      text: 'text-green-600',
      bg: 'bg-green-600'
    },
    purple: {
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      light: 'from-purple-50 to-purple-100',
      border: 'border-purple-500',
      text: 'text-purple-600',
      bg: 'bg-purple-600'
    }
  }

  const currentColor = colorSchemes[slides[currentSlide].color as keyof typeof colorSchemes]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full mb-6 border border-blue-100">
            <Sparkles className="text-blue-600" size={18} />
            <span className="text-sm font-semibold text-gray-700">产品演示</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            看看 Citea 如何工作
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            从搜索到验证，完整的学术研究工作流程
          </p>
        </div>

        {/* Main Showcase */}
        <div className="relative max-w-6xl mx-auto">
          {/* Card Container */}
          <div className={`bg-gradient-to-br ${currentColor.gradient} rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${isAnimating ? 'scale-95 opacity-90' : 'scale-100 opacity-100'}`}>
            <div className="aspect-[16/9] p-12 relative">
              {/* Content */}
              {currentSlide === 0 && (
                <div className="h-full flex items-center gap-12">
                  {/* Left Side - Steps */}
                  <div className="flex-1 space-y-6">
                    <div className="inline-block">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                        {slides[0].badge}
                      </span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-2">{slides[0].title}</h3>
                    <p className="text-xl text-blue-100 mb-8">{slides[0].subtitle}</p>
                    
                    <div className="space-y-4">
                      {[
                        { icon: Sparkles, text: 'Literature Source Verification', sub: 'Tracing and validating academic sources' },
                        { icon: Search, text: 'Scanning academic databases', sub: 'Connecting to PubMed, CrossRef, and ArXiv' },
                        { icon: CheckCircle, text: 'Cross-referencing citations', sub: 'Analyzing citation networks' },
                        { icon: Loader2, text: 'Validating authenticity', sub: 'Verifying DOI and publication records' }
                      ].map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all">
                          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <step.icon className="text-white" size={24} />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{step.text}</p>
                            <p className="text-blue-100 text-xs">{step.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/80 text-sm pt-4">
                      <span>Processing step 1 of 4</span>
                      <div className="flex gap-1.5">
                        {[0, 150, 300].map((delay) => (
                          <div key={delay} className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Mock Interface */}
                  <div className="flex-1">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform">
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                          <div key={item} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                              <Search className="text-white" size={20} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-200 rounded-full" style={{ width: `${90 - item * 10}%` }} />
                              <div className="h-2 bg-gray-100 rounded-full" style={{ width: `${70 - item * 5}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="h-full flex items-center gap-12">
                  <div className="flex-1 space-y-6">
                    <div className="inline-block">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                        {slides[1].badge}
                      </span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-2">{slides[1].title}</h3>
                    <p className="text-xl text-green-100 mb-8">{slides[1].subtitle}</p>
                    
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <p className="text-white text-sm mb-3">实时验证引用真实性</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-100">
                            <CheckCircle size={16} />
                            <span className="text-xs">CrossRef 数据库验证</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-100">
                            <CheckCircle size={16} />
                            <span className="text-xs">PubMed 记录确认</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-100">
                            <CheckCircle size={16} />
                            <span className="text-xs">DOI 链接验证</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-4 transform hover:scale-105 transition-transform">
                      <div className="border-l-4 border-green-500 bg-green-50 rounded-r-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={18} className="text-green-600" />
                          <span className="text-xs font-bold text-green-900">已验证</span>
                        </div>
                        <p className="text-sm text-gray-800 mb-1">Smith, J., & Johnson, M. (2020)...</p>
                        <p className="text-xs text-green-700 font-semibold">✓ Found in CrossRef</p>
                      </div>
                      
                      <div className="border-l-4 border-red-500 bg-red-50 rounded-r-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <span className="text-xs font-bold text-red-900">未找到</span>
                        </div>
                        <p className="text-sm text-gray-800 mb-1">Brown, A. (2023)...</p>
                        <p className="text-xs text-red-700 font-semibold">✗ Possibly fabricated</p>
                      </div>
                      
                      <div className="border-l-4 border-gray-300 bg-gray-50 rounded-r-xl p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 size={18} className="text-gray-600 animate-spin" />
                          <span className="text-sm text-gray-600">Checking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 2 && (
                <div className="h-full flex items-center gap-12">
                  <div className="flex-1 space-y-6">
                    <div className="inline-block">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                        {slides[2].badge}
                      </span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-2">{slides[2].title}</h3>
                    <p className="text-xl text-purple-100 mb-8">{slides[2].subtitle}</p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <p className="text-white text-sm mb-4">AI 助手可以帮您：</p>
                      <ul className="space-y-3 text-purple-100">
                        <li className="flex items-start gap-2">
                          <Sparkles size={16} className="mt-0.5" />
                          <span className="text-sm">解答引用格式问题</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Sparkles size={16} className="mt-0.5" />
                          <span className="text-sm">验证文献真实性</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Sparkles size={16} className="mt-0.5" />
                          <span className="text-sm">提供学术写作建议</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform">
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-end">
                          <div className="bg-purple-600 text-white rounded-2xl px-4 py-3 max-w-[80%] shadow-md">
                            <p className="text-sm">如何引用一篇有多个作者的期刊文章？</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[85%]">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
                                <Sparkles size={14} className="text-white" />
                              </div>
                              <span className="text-xs font-bold">AI Assistant</span>
                            </div>
                            <p className="text-sm text-gray-800 mb-2">在APA格式中：</p>
                            <ul className="text-xs text-gray-700 space-y-1">
                              <li>• 1-2位：列出所有</li>
                              <li>• 3-20位：列出所有</li>
                              <li>• 21位+：前19 + ... + 最后一位</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ask a question..."
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                          readOnly
                        />
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-xl">
                          <Sparkles size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-10 border border-gray-200"
          >
            <ChevronLeft size={28} className="text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-10 border border-gray-200"
          >
            <ChevronRight size={28} className="text-gray-700" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true)
                    setCurrentSlide(index)
                    setTimeout(() => setIsAnimating(false), 500)
                  }
                }}
                className={`transition-all rounded-full ${
                  index === currentSlide
                    ? `${currentColor.bg} w-12 h-3`
                    : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
