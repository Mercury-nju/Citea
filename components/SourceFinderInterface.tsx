'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, Sparkles, CheckCircle, Loader, ExternalLink, Copy } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import SearchProgressOverlay from './SearchProgressOverlay'

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
  const router = useRouter()
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
      const finalSources = step5Data.sources || []
      
      setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })))
      
      // 跳转到结果页面
      const resultsParam = encodeURIComponent(JSON.stringify({ sources: finalSources, count: finalSources.length }))
      const queryParam = encodeURIComponent(query)
      router.push(`/dashboard/results?type=finder&results=${resultsParam}&query=${queryParam}`)
      
      // 保存搜索历史
      if (onSearchComplete) {
        onSearchComplete(query, { sources: finalSources, count: finalSources.length })
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

  // 搜索中显示悬浮层
  if (isSearching) {
    return (
      <>
        <SearchProgressOverlay
          steps={steps.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            status: s.status
          }))}
          currentStep={currentStep}
          type="finder"
        />
        <div className="space-y-6 opacity-30 pointer-events-none">
          {/* 原始内容，但被模糊化 */}
        </div>
      </>
    )
  }

  // 不再显示结果，直接跳转到结果页
  // 输入界面

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
