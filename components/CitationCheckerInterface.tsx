'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, Sparkles, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import SearchProgressOverlay from './SearchProgressOverlay'

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
  const router = useRouter()
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

      // 获取token
      const token = localStorage.getItem('citea_auth_token')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Make API call
      const response = await fetch('/api/check-citations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`
        console.error('API error:', errorMessage, errorData)
        
        // 根据不同的错误类型显示不同的消息
        if (response.status === 401) {
          setError('请先登录后再使用此功能')
        } else if (response.status === 403) {
          setError(errorMessage || '积分不足，请升级账户')
        } else if (response.status === 400) {
          setError(errorMessage || '输入内容无效')
        } else {
          setError(errorMessage || '验证过程中出现错误，请重试')
        }
        return
      }

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        // 跳转到结果页面
        const resultsParam = encodeURIComponent(JSON.stringify(data))
        const queryParam = encodeURIComponent(text)
        router.push(`/dashboard/results?type=checker&results=${resultsParam}&query=${queryParam}`)
        
        // 保存搜索历史
        if (onCheckComplete) {
          onCheckComplete(text, data)
        }
      }
    } catch (err: any) {
      console.error('Citation check error:', err)
      const errorMessage = err?.message || '网络连接错误，请检查网络后重试'
      setError(errorMessage)
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

  // Loading state - 显示悬浮层
  if (isChecking) {
    return (
      <>
        <SearchProgressOverlay
          steps={steps.map(s => ({
            id: s.id,
            title: s.title,
            description: s.subtitle,
            status: s.status
          }))}
          currentStep={currentStep}
          type="checker"
        />
        <div className="space-y-6 opacity-30 pointer-events-none">
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
      </>
    )
  }

  // Results state - 不再显示结果，直接跳转到结果页
  // 结果现在在单独的页面显示

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
            maxLength={1000}
          />
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{text.length}/1000 字符</span>
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
