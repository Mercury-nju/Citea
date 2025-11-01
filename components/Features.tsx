'use client'

import { Search, CheckCircle, MessageSquare, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Features() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Search,
      title: t.features.sourceFinder.title,
      description: t.features.sourceFinder.description,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: CheckCircle,
      title: t.features.citationChecker.title,
      description: t.features.citationChecker.description,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MessageSquare,
      title: t.features.aiAssistant.title,
      description: t.features.aiAssistant.description,
      color: 'from-amber-500 to-orange-500',
    },
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.features.title}
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        {/* Features Grid - Three Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                  <Icon size={24} className="text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Demo Section Preview - Large Card */}
        <div className="bg-gradient-to-br from-slate-800/80 via-blue-900/80 to-slate-800/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Left: Feature List */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  AI 文献查找器
                </h3>
                <p className="text-blue-200 text-sm mb-8">
                  AI-powered academic literature search and verification
                </p>
                
                <div className="space-y-4">
                  {[
                    { title: 'Literature Source Verification', desc: 'Tracing and validating academic sources', active: true },
                    { title: 'Scanning academic databases', desc: 'Connecting to PubMed, CrossRef, and ArXiv', active: false },
                    { title: 'Cross-referencing citations', desc: 'Analyzing citation networks and relationships', active: false },
                    { title: 'Tracing publication lineage', desc: 'Mapping original sources and derivatives', active: false },
                    { title: 'Validating authenticity', desc: 'Verifying DOI and publication records', active: false }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-4 p-3 rounded-xl transition-all ${
                        item.active
                          ? 'bg-blue-500/20 border border-blue-400/50'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        item.active
                          ? 'bg-blue-500'
                          : 'bg-white/10'
                      }`}>
                        <Sparkles 
                          size={18} 
                          className={item.active ? 'text-white' : 'text-white/60'} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold mb-1 text-sm ${
                          item.active ? 'text-white' : 'text-white/80'
                        }`}>
                          {item.title}
                        </h4>
                        <p className={`text-xs ${
                          item.active ? 'text-blue-200' : 'text-white/50'
                        }`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-white/80 text-sm font-medium mb-2">Processing step 1 of 4</p>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                </div>
              </div>
            </div>

            {/* Right: Search Results Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Search size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" style={{ width: i === 1 ? '100%' : i === 2 ? '85%' : i === 3 ? '70%' : '60%' }} />
                      <div className="h-3 bg-gray-100 rounded" style={{ width: '50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
