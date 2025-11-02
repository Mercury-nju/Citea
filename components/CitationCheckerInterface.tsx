'use client'

import { useState } from 'react'
import { ArrowUp, Sparkles, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'

interface Citation {
  id: string
  text: string
  verified: boolean
  titleSimilarity: number
  authorsSimilarity: number
  dateSimilarity: number
  bestMatch?: {
    title: string
    authors: string
    date: string
    link: string
  }
}

interface CheckResult {
  citations: Citation[]
  totalFound: number
  verified: number
  verificationRate: number
}

type StepStatus = 'pending' | 'processing' | 'completed'

interface DetectionStep {
  id: number
  title: string
  subtitle: string
  status: StepStatus
}

interface CitationCheckerInterfaceProps {
  onCheckComplete?: (text: string, results?: any) => void
}

export default function CitationCheckerInterface({ onCheckComplete }: CitationCheckerInterfaceProps = {}) {
  const [text, setText] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
        // 保存搜索历史
        if (onCheckComplete) {
          onCheckComplete(text, data)
        }
      }
    } catch (err) {
      console.error('Citation check error:', err)
      setError('验证过程中出现错误，请重试')
    } finally {
      setIsChecking(false)
    }
  }

  const exampleText = `[60]Chen L., Park J. K. Exploring the Impact of Short-form Video Platforms on Youth Identity Formation[J]. Journal of Media and Communication Studies, 2023, 15(2): 112-129.

[61]山本玲奈. デジタル世代における宗教的自己表現の変化[J]. 現代社会研究, 2021, 27(4): 88-104.

[62]Johnson R. & Carter T. From Fandom to Activism: The Role of Online Communities in Social Movements[J]. Cultural Sociology Review, 2020, 8(1): 51-69.`

  const getSimilarityColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    if (value >= 30) return 'text-orange-600'
    return 'text-red-600'
  }

  // Loading state
  if (isChecking) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="text-blue-600 animate-spin" size={24} />
            <h3 className="text-lg font-bold text-gray-900">AI Content Detection</h3>
          </div>
          <p className="text-sm text-gray-600">Analyzing content authenticity</p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
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
        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-200 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">{result.verificationRate}%</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {result.verified}/{result.totalFound} citations verified
          </h3>
        </div>

        {/* Citations List */}
        <div className="space-y-4">
          {result.citations.map((citation) => (
            <div
              key={citation.id}
              className="rounded-xl border-2 border-gray-200 bg-white overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === citation.id ? null : citation.id)}
                className="w-full p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  citation.verified ? 'bg-red-500' : 'bg-gray-400'
                }`}>
                  <AlertCircle className="text-white" size={20} />
                </div>

                <div className="flex-1 text-left">
                  <p className="text-sm text-gray-800 mb-2">{citation.text}</p>
                </div>

                {expandedId === citation.id ? (
                  <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                ) : (
                  <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                )}
              </button>

              {/* Expanded Details */}
              {expandedId === citation.id && (
                <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-4">
                  {/* Similarity Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Title similarity</span>
                      <span className={`text-sm font-bold ${getSimilarityColor(citation.titleSimilarity)}`}>
                        {citation.titleSimilarity.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {citation.titleSimilarity < 95 ? 'Title similarity <95% (below 95% threshold)' : 'Title matches'}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Authors similarity</span>
                      <span className={`text-sm font-bold ${getSimilarityColor(citation.authorsSimilarity)}`}>
                        {citation.authorsSimilarity.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {citation.authorsSimilarity === 0 ? 'Authors completely different' : 'Authors partially match'}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Date similarity</span>
                      <span className={`text-sm font-bold ${getSimilarityColor(citation.dateSimilarity)}`}>
                        {citation.dateSimilarity.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {citation.dateSimilarity >= 80 ? 'Years match exactly' : citation.dateSimilarity > 0 ? 'Years differ by 3+' : 'No date match'}
                    </div>
                  </div>

                  {/* Best Match */}
                  {citation.bestMatch && (
                    <div className="pt-4 border-t border-gray-300">
                      <p className="text-sm font-bold text-gray-900 mb-3">Best Match:</p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                        <p className="text-sm font-semibold text-blue-600">{citation.bestMatch.title}</p>
                        <p className="text-xs text-gray-700"><strong>Authors:</strong> {citation.bestMatch.authors}</p>
                        <p className="text-xs text-gray-700"><strong>Date:</strong> {citation.bestMatch.date}年</p>
                        {citation.bestMatch.link && (
                          <a
                            href={citation.bestMatch.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink size={12} />
                            <strong>Link:</strong> {citation.bestMatch.link}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back Button */}
        <button
          onClick={() => {
            setResult(null)
            setText('')
            setExpandedId(null)
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="text-yellow-500" size={14} />
          <span className="text-xs font-medium text-gray-700">示例引用：</span>
        </div>
        <button
          onClick={() => setText(exampleText)}
          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-xs text-gray-700 leading-relaxed whitespace-pre-wrap"
        >
          {exampleText}
        </button>
      </div>
    </div>
  )
}
