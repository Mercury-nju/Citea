'use client'

import { Search, CheckCircle, MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function DetailedFeatures() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Everything you need for<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              reliable research
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive citation verification and source validation tools to ensure your academic work meets the highest standards.
          </p>
        </div>

        {/* Features Grid - Diagonal Layout */}
        <div className="space-y-32">
          {/* Feature 1 - Source Finder */}
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 order-2 md:order-1">
              <div className="relative group">
                {/* Floating Badge */}
                <div className="absolute -top-4 -left-4 z-10">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    AI Powered
                  </div>
                </div>
                
                {/* Main Card */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border border-blue-100 p-8 transform group-hover:scale-105 transition-all duration-500">
                  {/* Mock Interface */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <p className="text-xs text-gray-600 mb-3">研究查询</p>
                      <p className="text-sm text-gray-800">
                        Bardeen-Cooper-Schrieffer (BCS) theory...
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-blue-500 text-white rounded-xl p-4 flex items-center gap-3 shadow-md">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold">CrossRef</p>
                          <p className="text-xs opacity-90">Superconductivity at interfaces</p>
                        </div>
                      </div>
                      
                      <div className="bg-green-500 text-white rounded-xl p-4 flex items-center gap-3 shadow-md">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold">PubMed</p>
                          <p className="text-xs opacity-90">Cooper pairing in condensed matter</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Glow */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity" />
              </div>
            </div>
            
            <div className="md:col-span-7 order-1 md:order-2 md:pl-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-xl">
                <Search className="text-white" size={32} />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Source Finder
              </h3>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Find credible academic sources for your research topics automatically. Advanced search algorithms help you discover relevant, peer-reviewed sources from trusted academic databases.
              </p>
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all group"
              >
                Start searching
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Feature 2 - Citation Checker */}
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 md:pr-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 shadow-xl">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Citation Checker
              </h3>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Instantly verify the authenticity of academic references and citations. Our AI-powered system cross-references citations against authoritative academic databases.
              </p>
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all group"
              >
                Verify citations
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="md:col-span-5">
              <div className="relative group">
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 z-10">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Real-time
                  </div>
                </div>
                
                {/* Main Card */}
                <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl border border-green-100 p-8 transform group-hover:scale-105 transition-all duration-500">
                  <div className="space-y-3">
                    {/* Valid */}
                    <div className="border-l-4 border-green-500 bg-white rounded-r-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-xs font-bold text-green-900">已验证</span>
                      </div>
                      <p className="text-xs text-gray-700">Smith, J. (2020)...</p>
                    </div>
                    
                    {/* Invalid */}
                    <div className="border-l-4 border-red-500 bg-white rounded-r-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">!</span>
                        </div>
                        <span className="text-xs font-bold text-red-900">未找到</span>
                      </div>
                      <p className="text-xs text-gray-700">Brown, A. (2023)...</p>
                    </div>
                    
                    {/* Checking */}
                    <div className="border-l-4 border-gray-300 bg-white rounded-r-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                        <span className="text-xs text-gray-600">检查中...</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Glow */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-400 rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Feature 3 - Research Assistant */}
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 order-2 md:order-1">
              <div className="relative group">
                {/* Floating Badge */}
                <div className="absolute -top-4 -left-4 z-10">
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Sparkles size={14} />
                    BETA
                  </div>
                </div>
                
                {/* Main Card */}
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl border border-purple-100 p-8 transform group-hover:scale-105 transition-all duration-500">
                  <div className="space-y-3">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-purple-600 text-white rounded-2xl px-4 py-3 max-w-[80%] shadow-md">
                        <p className="text-xs">如何引用多个作者？</p>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl px-4 py-3 max-w-[85%] border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles size={12} className="text-white" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-900">AI</span>
                        </div>
                        <p className="text-xs text-gray-700">在APA格式中...</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Glow */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-400 rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity" />
              </div>
            </div>
            
            <div className="md:col-span-7 order-1 md:order-2 md:pl-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
                <MessageSquare className="text-white" size={32} />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Research Assistant
              </h3>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                AI-powered chat assistant for citation verification and source analysis. Ask questions about your references and get real-time guidance on source authenticity.
              </p>
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all group"
              >
                Chat with AI
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
