'use client'

import { useState } from 'react'
import { ArrowUp, Sparkles, CheckCircle, Loader, ExternalLink, Copy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface SearchStep {
  id: number
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed'
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

interface SourceFinderInterfaceProps {
  onSearchComplete?: (query: string, results?: any) => void
}

export default function SourceFinderInterface({ onSearchComplete }: SourceFinderInterfaceProps = {}) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<SearchStep[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [showResults, setShowResults] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [needUpgrade, setNeedUpgrade] = useState(false)

  const SEARCH_STEPS: SearchStep[] = [
    { id: 1, title: t.sourceFinder.step1, description: t.sourceFinder.step1Desc, status: 'pending' },
    { id: 2, title: t.sourceFinder.step2, description: t.sourceFinder.step2Desc, status: 'pending' },
    { id: 3, title: t.sourceFinder.step3, description: t.sourceFinder.step3Desc, status: 'pending' },
    { id: 4, title: t.sourceFinder.step4, description: t.sourceFinder.step4Desc, status: 'pending' },
    { id: 5, title: t.sourceFinder.step5, description: t.sourceFinder.step5Desc, status: 'pending' }
  ]

  const examplePrompts = [
    'Neural network-based models have been applied to predict protein folding structures with accuracy comparable to experimental methods.',
    'Quantum dot technologies enable tunable light emission properties, offering potential applications in next-generation display and photovoltaic systems.',
    'Social media usage has been linked to changes in adolescent mental health, particularly in relation to anxiety and self-esteem levels.',
  ]

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setShowResults(false)
    setOriginalText(query)
    setSources([])
    setCurrentStep(0)
    setSteps(SEARCH_STEPS.map(s => ({ ...s, status: 'pending' })))

    // 获取token
    const token = localStorage.getItem('citea_auth_token')
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const allSources: Source[] = []

    try {
      // Step 1: 智能分析用户意图，确定搜索策略
      setCurrentStep(0)
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx === 0 ? 'processing' : 'pending'
      })))
      
      const step1Response = await fetch('/api/find-sources', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: query, step: 1 }),
      })
      
      if (step1Response.status === 403) {
        setNeedUpgrade(true)
        throw new Error('Insufficient credits')
      }
      if (!step1Response.ok) {
        const errorData = await step1Response.json()
        throw new Error(errorData.error || 'Step 1 failed')
      }
      
      const step1Data = await step1Response.json()
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx === 0 ? 'completed' : idx === 1 ? 'processing' : 'pending'
      })))
      setCurrentStep(1)

      // Step 2: 搜索 CrossRef 数据库
      const step2Response = await fetch('/api/find-sources', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: query, step: 2 }),
      })
      
      if (step2Response.status === 403) {
        setNeedUpgrade(true)
        throw new Error('Insufficient credits')
      }
      if (step2Response.ok) {
        const step2Data = await step2Response.json()
        allSources.push(...(step2Data.sources || []))
      }
      
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx <= 1 ? 'completed' : idx === 2 ? 'processing' : 'pending'
      })))
      setCurrentStep(2)

      // Step 3: 搜索 PubMed 数据库（如果是医学相关）
      const shouldSearchPubMed = step1Data.strategy?.searchType === 'medical' || step1Data.strategy?.databases?.includes('PubMed')
      
      if (shouldSearchPubMed) {
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx <= 2 ? 'completed' : idx === 3 ? 'processing' : 'pending'
        })))
        setCurrentStep(3)
        
        const step3Response = await fetch('/api/find-sources', {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: query, step: 3 }),
        })
        
        if (step3Response.status === 403) {
          setNeedUpgrade(true)
          throw new Error('Insufficient credits')
        }
        if (step3Response.ok) {
          const step3Data = await step3Response.json()
          allSources.push(...(step3Data.sources || []))
        }
      } else {
        // 跳过 PubMed，直接标记为完成
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx <= 2 ? 'completed' : idx === 3 ? 'completed' : idx === 4 ? 'processing' : 'pending'
        })))
        setCurrentStep(4)
      }
      
      // 继续到 Step 4
      if (shouldSearchPubMed) {
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx <= 3 ? 'completed' : idx === 4 ? 'processing' : 'pending'
        })))
        setCurrentStep(4)
      }

      // Step 4: 搜索 Semantic Scholar 数据库
      const step4Response = await fetch('/api/find-sources', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: query, step: 4 }),
      })
      
      if (step4Response.status === 403) {
        setNeedUpgrade(true)
        throw new Error('Insufficient credits')
      }
      if (step4Response.ok) {
        const step4Data = await step4Response.json()
        allSources.push(...(step4Data.sources || []))
      }
      
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx <= 3 ? 'completed' : idx === 4 ? 'processing' : 'pending'
      })))
      setCurrentStep(4)

      // Step 5: 智能筛选和去重，返回最终结果
      const step5Response = await fetch('/api/find-sources', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: query, step: 5 }),
      })
      
      if (step5Response.status === 403) {
        setNeedUpgrade(true)
        throw new Error('Insufficient credits')
      }
      if (!step5Response.ok) throw new Error('Step 5 failed')
      
      const step5Data = await step5Response.json()
      setSources(step5Data.sources || [])
      
      setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })))
      
      await new Promise(resolve => setTimeout(resolve, 300))
      setShowResults(true)
      
      // 保存搜索历史
      if (onSearchComplete) {
        onSearchComplete(query, { sources: step5Data.sources || [], count: (step5Data.sources || []).length })
      }
    } catch (error) {
      console.error('Search error:', error)
      if (!needUpgrade) {
        alert(t.sourceFinder.searchFailed)
      }
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))
    } finally {
      setIsSearching(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        {/* Original Text */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">{t.sourceFinder.originalText}</h3>
            <p className="text-xs text-gray-500">{t.sourceFinder.clickToJump}</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {originalText}
            {sources.slice(0, 3).map((_, idx) => (
              <sup key={idx} className="inline-block mx-0.5">
                <button className="text-blue-600 font-semibold hover:underline text-xs">
                  [{idx + 1}]
                </button>
              </sup>
            ))}
          </p>
        </div>

        {/* Results Header */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t.sourceFinder.suggestTry}</h3>
          <p className="text-sm text-gray-600">{sources.length} {t.sourceFinder.papersFound}</p>
        </div>

        {/* Sources */}
        <div className="space-y-4">
          {sources.map((source, idx) => (
            <div key={source.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 leading-relaxed mb-1">
                      Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs through phonon interactions.
                    </p>
                    <p className="text-xs text-gray-500">{t.sourceFinder.supportingLit}（1 {t.sourceFinder.papers}）</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                {/* Badge & Actions */}
                <div className="flex items-center gap-2 mb-4">
                  {source.verified && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                      <CheckCircle size={12} />
                      {source.source}{t.sourceFinder.verified}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    <button 
                      onClick={() => window.open(source.doi ? `https://doi.org/${source.doi}` : '#', '_blank')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition border border-gray-200"
                    >
                      <ExternalLink size={12} />
                      {t.sourceFinder.visit}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(`${source.authors} (${source.year}). ${source.title}. ${source.journal}. DOI: ${source.doi || 'N/A'}`)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition border border-gray-200"
                    >
                      <Copy size={12} />
                      {t.sourceFinder.copy}
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-gray-900 mb-3 leading-snug">
                  {source.title}
                </h4>

                {/* Metadata */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>👤</span>
                    <span>{source.authors}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>📚</span>
                    <span className="italic">{source.journal}</span>
                    <span>•</span>
                    <span>📅</span>
                    <span>{source.year}</span>
                  </div>
                </div>

                {/* DOI */}
                {source.doi && (
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">DOI:</span>
                      <a 
                        href={`https://doi.org/${source.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {source.doi}
                      </a>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
                  <p className="text-[10px] font-bold text-blue-900 mb-1.5 uppercase">{t.sourceFinder.explanation}</p>
                  <p className="text-xs text-blue-800 leading-relaxed mb-2">
                    {t.sourceFinder.explanationText.replace('{source}', source.source)}
                  </p>
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-[10px] text-blue-700">
                      {t.sourceFinder.evidenceStrength} <span className="font-bold">{t.sourceFinder.strong}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back */}
        <button
          onClick={() => {
            setShowResults(false)
            setQuery('')
          }}
          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          {t.sourceFinder.newSearch}
        </button>
      </div>
    )
  }

  if (isSearching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-2xl">
          {/* Top Spinner */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 rounded-full border-3 border-blue-200 border-t-blue-600 animate-spin mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">{t.sourceFinder.searching}</h3>
            <p className="text-xs text-gray-600">{t.sourceFinder.searchingDesc}</p>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-50 border-2 border-green-200'
                    : step.status === 'processing'
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'processing'
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle className="text-white" size={18} />
                    ) : step.status === 'processing' ? (
                      <Loader className="text-white animate-spin" size={18} />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">{step.title}</h4>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                  {step.status === 'processing' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Dots */}
          <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
            <span>{t.sourceFinder.processingStep} {currentStep + 1} {t.sourceFinder.of} {steps.length}</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {needUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t.pricing?.creditUsage || (t.sourceFinder?.searching || 'Insufficient Credits')}</h3>
            <p className="text-sm text-gray-700 mb-4">{t.pricing?.upgradeDesc || 'Insufficient credits to proceed. Please upgrade your plan to continue.'}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setNeedUpgrade(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">{t.header?.cancel || 'Cancel'}</button>
              <a href="/pricing" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">{t.pricing?.upgrade || 'Upgrade'}</a>
            </div>
          </div>
        </div>
      )}
      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.sourceFinder.inputPlaceholder}
            className="w-full h-48 p-3 border-0 focus:ring-0 resize-none text-sm text-gray-900 placeholder-gray-400"
            maxLength={5000}
          />
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{query.length}/5000 {t.sourceFinder.characterCount}</span>
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="bg-gray-900 text-white p-2.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="text-yellow-500" size={14} />
          <span className="text-xs font-medium text-gray-700">{t.sourceFinder.examples}</span>
        </div>
        <div className="space-y-2">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setQuery(prompt)}
              className="block w-full text-left px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition text-xs text-gray-700 leading-relaxed"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
