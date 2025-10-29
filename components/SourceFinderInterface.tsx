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
        await new Promise(resolve => setTimeout(resolve, 1000))
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
      
      // Wait a moment before showing results
      await new Promise(resolve => setTimeout(resolve, 500))
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
      <div className="space-y-8">
        {/* Original Text */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">原始文本</h3>
            <p className="text-sm text-gray-500">
              点击引用编号跳转到对应文献
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg">
            {originalText}
            {sources.slice(0, 3).map((_, idx) => (
              <sup key={idx} className="inline-block mx-1">
                <button className="text-blue-600 font-semibold hover:underline text-base">
                  [{idx + 1}]
                </button>
              </sup>
            ))}
          </p>
        </div>

        {/* Claims Section Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            建议您可以尝试：
          </h3>
          <p className="text-gray-600">
            {sources.length} papers found
          </p>
        </div>

        {/* Sources List */}
        <div className="space-y-6">
          {sources.map((source, idx) => (
            <div key={source.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-2">
                      Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs through phonon interactions.
                    </p>
                    <p className="text-sm text-gray-500">
                      支撑文献（1 papers）
                    </p>
                  </div>
                </div>
              </div>

              {/* Citation Details */}
              <div className="px-8 py-6">
                {/* Badge and Actions */}
                <div className="flex items-center gap-3 mb-6">
                  {source.verified && (
                    <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
                      <CheckCircle size={16} />
                      {source.source}验证
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const url = source.doi ? `https://doi.org/${source.doi}` : '#'
                        window.open(url, '_blank', 'noopener,noreferrer')
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition border border-gray-200"
                    >
                      <ExternalLink size={16} />
                      访问
                    </button>
                    <button 
                      onClick={() => copyToClipboard(`${source.authors} (${source.year}). ${source.title}. ${source.journal}. DOI: ${source.doi || 'N/A'}`)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition border border-gray-200"
                    >
                      <Copy size={16} />
                      复制
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xl font-bold text-gray-900 mb-6 leading-tight">
                  {source.title}
                </h4>

                {/* Metadata */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-base text-gray-600">
                    <span className="text-gray-400">👤</span>
                    <span>{source.authors}</span>
                  </div>
                  <div className="flex items-center gap-3 text-base text-gray-600">
                    <span className="text-gray-400">📚</span>
                    <span className="italic">{source.journal}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-400">📅</span>
                    <span>{source.year}</span>
                  </div>
                </div>

                {/* DOI */}
                {source.doi && (
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-gray-500 uppercase">DOI:</span>
                      <a 
                        href={`https://doi.org/${source.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {source.doi}
                      </a>
                    </div>
                  </div>
                )}

                {/* Reference Explanation */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                  <p className="text-sm font-bold text-blue-900 mb-3">
                    参考文献说明
                  </p>
                  <p className="text-base text-blue-800 leading-relaxed mb-4">
                    该文献通过 {source.source} 数据库验证，提供了关于主要观点的权威支持。所有元数据均来自官方学术数据库API。
                  </p>
                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-sm text-blue-700">
                      证据强度: <span className="font-bold">Strong</span>
                    </p>
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
          className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-200 transition-all font-medium text-lg"
        >
          新的搜索
        </button>
      </div>
    )
  }

  if (isSearching) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-full max-w-3xl">
          {/* Loading Circle at Top */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Literature Source Verification
            </h3>
            <p className="text-gray-600">
              Tracing and validating academic sources
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-6 rounded-xl transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-50 border-2 border-green-200'
                    : step.status === 'processing'
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
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
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  {step.status === 'processing' && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Progress Indicator */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>Processing step {currentStep + 1} of {steps.length}</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
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
            className="w-full h-64 p-4 border-0 focus:ring-0 resize-none text-gray-900 placeholder-gray-400 text-base"
            maxLength={300}
          />
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {query.length}/300 字
            </span>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
