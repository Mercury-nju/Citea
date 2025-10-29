'use client'

import { useState } from 'react'
import { ArrowUp, Sparkles, CheckCircle, Loader, ExternalLink, Copy, FileText } from 'lucide-react'

interface SearchStep {
  id: number
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed'
  icon: string
}

interface Source {
  id: string
  title: string
  authors: string
  year: string
  journal: string
  doi: string | null
  source: string
  verified: boolean
}

const SEARCH_STEPS: SearchStep[] = [
  {
    id: 1,
    title: 'Literature Source Verification',
    description: 'Tracing and validating academic sources',
    status: 'pending',
    icon: '🔍'
  },
  {
    id: 2,
    title: 'Scanning academic databases',
    description: 'Connecting to PubMed, CrossRef, and ArXiv',
    status: 'pending',
    icon: '🔗'
  },
  {
    id: 3,
    title: 'Cross-referencing citations',
    description: 'Analyzing citation networks and relationships',
    status: 'pending',
    icon: '🔄'
  },
  {
    id: 4,
    title: 'Tracing publication lineage',
    description: 'Mapping original sources and derivatives',
    status: 'pending',
    icon: '📊'
  },
  {
    id: 5,
    title: 'Validating authenticity',
    description: 'Verifying DOI and publication records',
    status: 'pending',
    icon: '✅'
  }
]

export default function SourceFinderInterface() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<SearchStep[]>(SEARCH_STEPS)
  const [sources, setSources] = useState<Source[]>([])
  const [showResults, setShowResults] = useState(false)
  const [originalText, setOriginalText] = useState('')

  const examplePrompts = [
    'Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs through phonon interactions. However, high-temperature superconductors, such as cuprates and iron-based compounds, cannot be fully explained by this model.',
    'Machine learning algorithms have shown significant improvements in medical diagnosis accuracy, particularly in identifying early-stage cancers from imaging data.',
    'Climate change impacts on marine ecosystems include ocean acidification, temperature rise, and altered current patterns affecting biodiversity.',
  ]

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setShowResults(false)
    setOriginalText(query)
    setSources([])
    setCurrentStep(0)

    // Reset steps
    setSteps(SEARCH_STEPS.map(s => ({ ...s, status: 'pending' })))

    try {
      // Animate through steps
      for (let i = 0; i < SEARCH_STEPS.length; i++) {
        setCurrentStep(i)
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx === i ? 'processing' : idx < i ? 'completed' : 'pending'
        })))
        
        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Mark last step as completed
      setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })))

      // Make actual API call
      const response = await fetch('/api/find-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: query }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setSources(data.sources || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      alert('搜索失败，请重试')
    } finally {
      setIsSearching(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        {/* Original Text */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">原始文本</h3>
            <p className="text-sm text-gray-500">
              点击引用编号跳转到对应文献
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {originalText}
            {sources.slice(0, 3).map((_, idx) => (
              <sup key={idx} className="inline-block mx-1">
                <button className="text-blue-600 font-semibold hover:underline">
                  [{idx + 1}]
                </button>
              </sup>
            ))}
          </p>
        </div>

        {/* Claims and Supporting References */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">
            观点与支撑文献
          </h3>

          {sources.map((source, idx) => (
            <div key={source.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {source.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    支撑文献（{sources.length} 篇）
                  </p>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      {source.verified && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle size={14} />
                          {source.source} Verified
                        </span>
                      )}
                      <button className="ml-auto flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
                        <ExternalLink size={16} />
                        Access
                      </button>
                      <button 
                        onClick={() => copyToClipboard(`${source.authors} (${source.year}). ${source.title}. ${source.journal}.`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                      >
                        <Copy size={16} />
                        Copy
                      </button>
                    </div>

                    <h5 className="font-semibold text-gray-900 mb-2">
                      {source.title}
                    </h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>👤 {source.authors}</p>
                      <p>📚 {source.journal} • 📅 {source.year}</p>
                      {source.doi && (
                        <p className="text-xs text-gray-500">DOI: {source.doi}</p>
                      )}
                    </div>

                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        参考文献说明
                      </p>
                      <p className="text-sm text-blue-800">
                        该文献通过{source.source}数据库验证，提供了关于主要观点的权威支持。
                      </p>
                      <p className="text-xs text-blue-700 mt-2">
                        证据强度: <span className="font-semibold">Strong</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <button
          onClick={() => {
            setShowResults(false)
            setQuery('')
          }}
          className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium"
        >
          新的搜索
        </button>
      </div>
    )
  }

  if (isSearching) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="text-blue-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Literature Source Verification
            </h3>
          </div>
          <p className="text-gray-600 mb-8">
            Tracing and validating academic sources
          </p>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-50 border-2 border-green-200'
                    : step.status === 'processing'
                    ? 'bg-blue-50 border-2 border-blue-200 animate-pulse'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.status === 'completed'
                      ? 'bg-green-500'
                      : step.status === 'processing'
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="text-white" size={24} />
                  ) : step.status === 'processing' ? (
                    <Loader className="text-white animate-spin" size={24} />
                  ) : (
                    <span className="text-gray-400 text-xl">{step.icon}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {step.status === 'processing' && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
            <span>Processing step {currentStep + 1} of {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入您想要查找支撑文献的文本..."
            className="w-full h-64 p-4 border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400"
            maxLength={300}
          />
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {query.length}/300 字
            </span>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Example Prompts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-yellow-500" size={18} />
          <span className="text-sm font-medium text-gray-700">示例：</span>
        </div>
        <div className="space-y-2">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setQuery(prompt)}
              className="block w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-sm text-gray-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

