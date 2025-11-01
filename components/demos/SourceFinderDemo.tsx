'use client'

import { useState } from 'react'
import { Search, Sparkles, CheckCircle, Zap } from 'lucide-react'

export default function SourceFinderDemo() {
  const [isSearching, setIsSearching] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const handleDemo = () => {
    setIsSearching(true)
    setCurrentStep(1)
    
    // 模拟步骤进度
    const steps = [1, 2, 3, 4]
    let stepIndex = 0
    const interval = setInterval(() => {
      stepIndex++
      if (stepIndex < steps.length) {
        setCurrentStep(steps[stepIndex])
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setIsSearching(false)
          setCurrentStep(1)
        }, 1000)
      }
    }, 800)
  }

  const features = [
    {
      title: 'Literature Source Verification',
      description: 'Tracing and validating academic sources',
      icon: CheckCircle,
    },
    {
      title: 'Scanning academic databases',
      description: 'Connecting to PubMed, CrossRef, and ArXiv',
      icon: Search,
    },
    {
      title: 'Cross-referencing citations',
      description: 'Analyzing citation networks and relationships',
      icon: Sparkles,
    },
    {
      title: 'Tracing publication lineage',
      description: 'Mapping original sources and derivatives',
      icon: Zap,
    },
    {
      title: 'Validating authenticity',
      description: 'Verifying DOI and publication records',
      icon: CheckCircle,
    },
  ]

  return (
    <div className="relative min-h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 h-full">
        {/* Left Section - Features & Progress */}
        <div className="flex flex-col justify-between">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              AI 文献查找器
            </h2>
            <p className="text-blue-200 text-sm">
              AI-powered academic literature search and verification
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isActive = isSearching && currentStep > index
              
              return (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
                    isActive
                      ? 'bg-blue-500/20 border border-blue-400/50 shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                      : 'bg-white/10'
                  }`}>
                    <Icon 
                      className={isActive ? 'text-white' : 'text-white/60'} 
                      size={20} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold mb-1 transition-colors ${
                      isActive ? 'text-white' : 'text-white/80'
                    }`}>
                      {feature.title}
                    </p>
                    <p className={`text-sm transition-colors ${
                      isActive ? 'text-blue-200' : 'text-white/50'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress Indicator */}
          {isSearching && (
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">
                  Processing step {currentStep} of 4
                </span>
                <span className="text-blue-300 text-sm font-semibold">
                  {Math.round((currentStep / 4) * 100)}%
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                      step <= currentStep
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                        : 'bg-white/20'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Results Preview */}
        <div className="flex flex-col">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex-1 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Search Results</h3>
              <p className="text-blue-200 text-sm">
                {isSearching ? 'Searching across multiple databases...' : 'Found relevant academic sources'}
              </p>
            </div>

            {/* Result Cards */}
            <div className="space-y-4 flex-1 overflow-y-auto">
              {[1, 2, 3, 4].map((item, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-4 flex items-start gap-4 transition-all duration-500 ${
                    isSearching && index >= currentStep
                      ? 'opacity-30 scale-95'
                      : 'opacity-100 shadow-lg'
                  }`}
                  style={{
                    animationDelay: `${index * 200}ms`,
                  }}
                >
                  {/* Icon Circle */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Search className="text-blue-600" size={20} />
                  </div>
                  
                  {/* Content Placeholder */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            {!isSearching && (
              <button
                onClick={handleDemo}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                <span>开始搜索</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

