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
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.features.title}
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}>
                  <Icon size={32} className="text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" 
                     style={{ background: `linear-gradient(to bottom right, #3b82f6, #8b5cf6)` }} 
                />
              </div>
            )
          })}
        </div>

        {/* Demo Section Preview */}
        <div className="mt-20 bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Feature List */}
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white mb-8">
                {t.features.sourceFinder.title}
              </h3>
              
              {[
                'Literature Source Verification',
                'Scanning academic databases',
                'Cross-referencing citations',
                'Tracing publication lineage',
                'Validating authenticity'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{item}</h4>
                    <p className="text-blue-100 text-sm mt-1">
                      {i === 0 && 'Tracing and validating academic sources'}
                      {i === 1 && 'Connecting to PubMed, CrossRef, and ArXiv'}
                      {i === 2 && 'Analyzing citation networks and relationships'}
                      {i === 3 && 'Mapping original sources and derivatives'}
                      {i === 4 && 'Verifying DOI and publication records'}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <p className="text-blue-100 text-sm">Processing step 1 of 4</p>
                <div className="flex gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-75" />
                  <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse delay-150" />
                </div>
              </div>
            </div>

            {/* Right: Visual Demo */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Search size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2" style={{ width: i === 1 ? '100%' : i === 2 ? '85%' : i === 3 ? '70%' : '60%' }} />
                      <div className="h-3 bg-gray-200 rounded" style={{ width: '50%' }} />
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
