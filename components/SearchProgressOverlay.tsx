'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, X } from 'lucide-react'

interface Step {
  id: number
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
}

interface SearchProgressOverlayProps {
  steps: Step[]
  currentStep: number
  onClose?: () => void
  type: 'finder' | 'checker'
}

export default function SearchProgressOverlay({ 
  steps, 
  currentStep, 
  onClose,
  type 
}: SearchProgressOverlayProps) {
  const [displaySteps, setDisplaySteps] = useState<Step[]>(steps)

  useEffect(() => {
    setDisplaySteps(steps.map((step, index) => ({
      ...step,
      status: index < currentStep 
        ? 'completed' 
        : index === currentStep 
        ? 'processing' 
        : 'pending'
    })))
  }, [steps, currentStep])

  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'processing':
        return <Loader2 className="text-blue-500 animate-spin" size={20} />
      case 'error':
        return <X className="text-red-500" size={20} />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 模糊背景 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 悬浮卡片 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {type === 'finder' ? '正在搜索文献...' : '正在验证引文...'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              请稍候，我们正在为您处理
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* 步骤列表 */}
        <div className="px-6 py-6 space-y-4 max-h-[400px] overflow-y-auto">
          {displaySteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                step.status === 'processing'
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : step.status === 'completed'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {/* 图标 */}
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step.status)}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold mb-1 ${
                  step.status === 'processing'
                    ? 'text-blue-900'
                    : step.status === 'completed'
                    ? 'text-green-900'
                    : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${
                  step.status === 'processing'
                    ? 'text-blue-700'
                    : step.status === 'completed'
                    ? 'text-green-700'
                    : 'text-gray-500'
                }`}>
                  {step.description}
                </p>
              </div>

              {/* 进度指示器 */}
              {step.status === 'processing' && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {type === 'finder' 
              ? '正在从多个学术数据库中搜索相关文献...' 
              : '正在验证引文的真实性和准确性...'}
          </p>
        </div>
      </div>
    </div>
  )
}

