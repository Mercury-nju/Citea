'use client'

import { useState } from 'react'
import { ArrowUp, Sparkles, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react'

interface Citation {
  id: string
  text: string
  verified: boolean
  status: 'valid' | 'invalid' | 'uncertain'
  doi?: string
  pmid?: string
  source?: string
  reason?: string
  confidence?: number
}

interface CheckResult {
  citations: Citation[]
  totalFound: number
  verified: number
  verificationRate: number
}

export default function CitationCheckerInterface() {
  const [text, setText] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  type StepStatus = 'pending' | 'processing' | 'completed'

  interface DetectionStep {
    id: number
    title: string
    subtitle: string
    status: StepStatus
  }

  const detectionSteps: DetectionStep[] = [
    {
      id: 1,
      title: 'AI Content Detection',
      subtitle: 'Analyzing content authenticity',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Analyzing content patterns',
      subtitle: 'Detecting linguistic and structural signatures',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Running AI detection algorithms',
      subtitle: 'Comparing against known AI-generated patterns',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Cross-referencing writing styles',
      subtitle: 'Analyzing consistency and human markers',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Finalizing authenticity score',
      subtitle: 'Generating comprehensive analysis report',
      status: 'pending'
    }
  ]

  const [steps, setSteps] = useState<DetectionStep[]>(detectionSteps)

  const handleCheck = async () => {
    if (!text.trim()) {
      setError('请输入需要验证的引用文本')
      return
    }

    setIsChecking(true)
    setError(null)
    setResult(null)
    setCurrentStep(0)
    setSteps(detectionSteps.map(s => ({ ...s, status: 'pending' as StepStatus })))

    try {
      // Animate through steps
      for (let i = 0; i < detectionSteps.length; i++) {
        setCurrentStep(i)
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: (idx === i ? 'processing' : idx < i ? 'completed' : 'pending') as StepStatus
        })))
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Complete all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'completed' as StepStatus })))

      // Make API call
      const response = await fetch('/api/check-citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('验证失败')
      }

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      console.error('Citation check error:', err)
      setError('验证过程中出现错误，请重试')
    } finally {
      setIsChecking(false)
    }
  }

  const exampleText = `[57]Anonymous. MTV, MTV & Verizon Team Up for an MTV VOD First on Verizon FiOS TV[J]. Network Weekly News, 2008.3-5.

[58]이차림. 대중음악 현상으로 본 한국 스트릿 댄스의 의미[J]. 우리춤과 과학기술, 2022, 18(3): 35-55.

[59]Griffin C E. The trouble with class: researching youth, class and culture beyond the 'Birmingham School'[J]. Journal of youth studies, 2011, 14(3): 245-259.`

  // Loading state
  if (isChecking) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="text-blue-600 animate-spin" size={24} />
            <h3 className="text-lg font-bold text-gray-900">AI Content Detection</h3>
          </div>
          <p className="text-sm text-gray-600">Analyzing content authenticity</p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`rounded-xl p-5 border-2 transition-all ${
                step.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : step.status === 'processing'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-green-500'
                      : step.status === 'processing'
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="text-white" size={20} />
                  ) : step.status === 'processing' ? (
                    <Loader2 className="text-white animate-spin" size={20} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900">{step.title}</h4>
                  <p className="text-xs text-gray-600">{step.subtitle}</p>
                </div>
                {step.status === 'processing' && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
          <span>Processing step {currentStep + 1} of {steps.length}</span>
          <div className="flex gap-1">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Results state
  if (result) {
    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-200 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">{result.verificationRate}%</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {result.verified}/{result.totalFound} citations verified
          </h3>
          <p className="text-gray-600 text-sm">
            Found {result.totalFound} citations, {result.verified} verified in academic databases
          </p>
        </div>

        {/* Citations List */}
        <div className="space-y-4">
          {result.citations.map((citation, index) => (
            <div
              key={citation.id}
              className={`rounded-xl border-2 p-5 hover:shadow-md transition-all cursor-pointer group ${
                citation.status === 'valid'
                  ? 'border-green-200 bg-green-50/50'
                  : citation.status === 'invalid'
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-yellow-200 bg-yellow-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    citation.status === 'valid'
                      ? 'bg-green-500'
                      : citation.status === 'invalid'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                >
                  {citation.status === 'valid' ? (
                    <CheckCircle className="text-white" size={20} />
                  ) : (
                    <AlertCircle className="text-white" size={20} />
                  )}
                </div>

                {/* Citation Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                    {citation.text}
                  </p>
                  
                  {citation.status === 'valid' && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-green-700">
                        ✓ Verified - Found in {citation.source} database
                      </p>
                      {citation.doi && (
                        <p className="text-xs text-green-600">
                          DOI: {citation.doi}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {citation.status === 'invalid' && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-red-700">
                        ✗ Not Found - Possibly fabricated citation
                      </p>
                      <p className="text-xs text-red-600">
                        ⚠️ Could not verify in any academic database
                      </p>
                      {citation.reason && (
                        <p className="text-xs text-red-600 italic">
                          {citation.reason}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {citation.status === 'uncertain' && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-yellow-700">
                        ⚠️ Unable to verify automatically
                      </p>
                      <p className="text-xs text-yellow-600">
                        {citation.reason || 'Manual verification recommended'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight
                  className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0"
                  size={20}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <button
          onClick={() => {
            setResult(null)
            setText('')
          }}
          className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium"
        >
          Check New Citations
        </button>
      </div>
    )
  }

  // Input state
  return (
    <div className="space-y-5">
      {/* Input Area */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴您的引用列表进行验证..."
            className="w-full h-64 p-3 border-0 focus:ring-0 resize-none text-sm text-gray-900 placeholder-gray-400"
            maxLength={5000}
          />
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{text.length}/5000 字符</span>
            <button
              onClick={handleCheck}
              disabled={!text.trim() || isChecking}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
            >
              <ArrowUp size={16} />
              Verify Citations
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Example */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="text-yellow-500" size={14} />
          <span className="text-xs font-medium text-gray-700">示例引用：</span>
        </div>
        <button
          onClick={() => setText(exampleText)}
          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-xs text-gray-700 leading-relaxed"
        >
          {exampleText}
        </button>
      </div>
    </div>
  )
}

