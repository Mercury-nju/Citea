'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Volume2, Maximize, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function ProductShowcase() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTab, setCurrentTab] = useState<'finder' | 'checker' | 'assistant'>('finder')
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const demos = {
    finder: {
      title: '文献查找',
      description: 'AI 驱动的智能搜索，从学术数据库中自动查找相关文献',
      duration: 84, // seconds
      durationDisplay: '1:24'
    },
    checker: {
      title: '引用验证',
      description: '实时验证引用真实性，识别虚假文献，确保学术诚信',
      duration: 135,
      durationDisplay: '2:15'
    },
    assistant: {
      title: 'AI 研究助手',
      description: '智能对话助手，回答学术问题，提供引用建议',
      duration: 108,
      durationDisplay: '1:48'
    }
  }

  // 播放进度控制
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const duration = demos[currentTab].duration
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.1
        })
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, currentTab])

  // 计算进度百分比
  useEffect(() => {
    const duration = demos[currentTab].duration
    setProgress((currentTime / duration) * 100)
  }, [currentTime, currentTab])

  // 切换标签时重置
  const handleTabChange = (tab: 'finder' | 'checker' | 'assistant') => {
    setCurrentTab(tab)
    setIsPlaying(false)
    setCurrentTime(0)
    setProgress(0)
  }

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6 border border-blue-100">
            <Sparkles className="text-blue-600" size={18} />
            <span className="text-sm font-semibold text-blue-900">产品演示</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            看看 Citea 如何工作
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            真实的操作界面，完整的学术研究工作流程
          </p>
        </div>

        {/* Video Player Style Display */}
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center gap-3 mb-6">
            {(['finder', 'checker', 'assistant'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentTab === tab
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {demos[tab].title}
              </button>
            ))}
          </div>

          {/* Video Player Container */}
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden">
            {/* Video Display Area */}
            <div className="relative aspect-video bg-black">
              {/* 动画演示预览 */}
              <DashboardPreview tab={currentTab} isPlaying={isPlaying} progress={progress} />
              
              {/* Play Overlay */}
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
                >
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="text-white ml-2" size={40} fill="white" />
                  </div>
                </button>
              )}

              {/* Time Progress Bar (when playing) */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls */}
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="text-white" size={20} fill="white" />
                  ) : (
                    <Play className="text-white ml-0.5" size={20} fill="white" />
                  )}
                </button>
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {demos[currentTab].durationDisplay}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Volume2 size={20} />
                </button>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  立即体验
                </Link>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {demos[currentTab].title}
            </h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              {demos[currentTab].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Dashboard Preview Component - 带动画的演示
function DashboardPreview({ 
  tab, 
  isPlaying, 
  progress 
}: { 
  tab: 'finder' | 'checker' | 'assistant'
  isPlaying: boolean
  progress: number 
}) {
  if (tab === 'finder') {
    return <FinderDashboard isPlaying={isPlaying} progress={progress} />
  } else if (tab === 'checker') {
    return <CheckerDashboard isPlaying={isPlaying} progress={progress} />
  } else {
    return <AssistantDashboard isPlaying={isPlaying} progress={progress} />
  }
}

// 真实Dashboard组件 - 带动画效果
function FinderDashboard({ isPlaying, progress }: { isPlaying: boolean; progress: number }) {
  // 根据进度显示不同的动画阶段
  const showTyping = isPlaying && progress > 10 && progress < 30
  const showSearch = isPlaying && progress >= 30 && progress < 50
  const showResults = isPlaying && progress >= 50

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Mock Browser Top Bar */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-500">
          citea.app/source-finder
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5 mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🔍</span>
          </div>
          <span className="font-bold text-gray-900">Source Finder</span>
        </div>
        <textarea
          readOnly
          value="Bardeen-Cooper-Schrieffer (BCS) theory, where electrons form Cooper pairs through phonon interactions. However, high-temperature superconductors, such as cuprates and iron-based compounds, cannot be fully explained by this model."
          className="w-full h-24 text-sm text-gray-700 resize-none border-0 focus:outline-none leading-relaxed"
        />
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
          <div className="flex gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">235 characters</span>
            {showTyping && (
              <span className="text-xs text-blue-600 font-medium animate-pulse">⌨️ Typing...</span>
            )}
            {!isPlaying && (
              <span className="text-xs text-blue-600 font-medium">✓ Ready to search</span>
            )}
          </div>
          <button className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            showSearch ? 'animate-pulse shadow-xl scale-105' : 'shadow-lg'
          }`}>
            {showSearch ? '🔍 Searching...' : '🚀 Search Sources'}
          </button>
        </div>
      </div>

      {/* Results with more details */}
      <div className="space-y-3 flex-1 overflow-hidden">
        {showResults && (
          <div className="text-xs font-semibold text-gray-500 mb-2 animate-fade-in">
            Found 12 results in 0.8s
          </div>
        )}
        
        <div className={`bg-white border-2 border-blue-200 rounded-xl p-4 shadow-md hover:shadow-xl transition-all ${
          showResults ? 'animate-slide-up' : 'opacity-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">✓ Verified • CrossRef</span>
            <span className="text-xs text-gray-500">98% match</span>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1.5 leading-tight">Superconductivity at interfaces between conventional and unconventional superconductors</h4>
          <p className="text-xs text-gray-600 mb-2">👤 J C Inkson • 📚 Journal of Physics C: Solid State Physics • 📅 1975</p>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">DOI: 10.1088/0022-3719/8/13/021</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">1,247 citations</span>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-md hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">✓ Verified • PubMed</span>
            <span className="text-xs text-gray-500">95% match</span>
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1.5 leading-tight">Cooper pairing in condensed matter systems</h4>
          <p className="text-xs text-gray-600 mb-2">👤 A. Smith, B. Johnson, C. Lee • 📚 Physical Review B • 📅 2018</p>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">PMID: 29845632</span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Impact: 8.2</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">✓ arXiv</span>
            <span className="text-xs text-gray-500">89% match</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">High-temperature superconductivity mechanisms...</h4>
          <p className="text-xs text-gray-600">👤 Multiple authors • 📚 arXiv preprint • 📅 2023</p>
        </div>
      </div>
    </div>
  )
}

function CheckerDashboard({ isPlaying, progress }: { isPlaying: boolean; progress: number }) {
  const showChecking = isPlaying && progress > 20 && progress < 50
  const showResults = isPlaying && progress >= 50

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Mock Browser Top Bar */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-500">
          citea.app/citation-checker
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`bg-green-50 border border-green-200 rounded-lg p-3 text-center transition-all ${
          showChecking ? 'animate-pulse' : ''
        }`}>
          <div className="text-2xl font-bold text-green-600">{showResults ? '2' : '0'}</div>
          <div className="text-xs text-green-700 font-medium">Verified</div>
        </div>
        <div className={`bg-red-50 border border-red-200 rounded-lg p-3 text-center transition-all ${
          showChecking ? 'animate-pulse' : ''
        }`}>
          <div className="text-2xl font-bold text-red-600">{showResults ? '1' : '0'}</div>
          <div className="text-xs text-red-700 font-medium">Not Found</div>
        </div>
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 text-center transition-all ${
          showChecking ? 'animate-pulse' : ''
        }`}>
          <div className="text-2xl font-bold text-blue-600">{showResults ? '67%' : '0%'}</div>
          <div className="text-xs text-blue-700 font-medium">Accuracy</div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-3 overflow-hidden">
        {/* Valid Citation 1 */}
        <div className="border-l-4 border-green-500 bg-white rounded-r-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                Smith, J., & Johnson, M. (2020). Machine learning in healthcare. <em>Nature Medicine</em>, 26(5), 123-130.
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">✓ Verified</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">CrossRef</span>
              </div>
              <p className="text-xs text-green-600 mt-2">DOI: 10.1038/s41591-020-0001-x • Citations: 1,456</p>
            </div>
          </div>
        </div>

        {/* Invalid Citation */}
        <div className="border-l-4 border-red-500 bg-white rounded-r-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                Brown, A. (2023). Fake research paper. <em>Journal of Made Up Studies</em>, 15(3), 45-67.
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">✗ Not Found</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Fake</span>
              </div>
              <p className="text-xs text-red-600 mt-2">⚠️ Unable to verify in any academic database</p>
            </div>
          </div>
        </div>

        {/* Valid Citation 2 */}
        <div className="border-l-4 border-green-500 bg-white rounded-r-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                Lee, K. (2019). Academic writing best practices...
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">✓ Verified</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">PubMed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssistantDashboard({ isPlaying, progress }: { isPlaying: boolean; progress: number }) {
  const showFirstMessage = isPlaying && progress > 15
  const showResponse = isPlaying && progress > 40
  const showSecondMessage = isPlaying && progress > 70
  const showTyping = isPlaying && progress > 85

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Mock Browser Top Bar */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-500">
          citea.app/ai-assistant
        </div>
      </div>

      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="text-white font-bold">AI Research Assistant</h3>
            <p className="text-purple-200 text-xs">Online • Ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-hidden mb-4">
        {/* User Message */}
        {showFirstMessage && (
          <div className="flex justify-end animate-slide-in-right">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[75%] shadow-md">
              <p className="text-sm">How do I cite a journal article with multiple authors in APA format?</p>
            </div>
          </div>
        )}

        {/* AI Response with Rich Content */}
        {showResponse && (
          <div className="flex justify-start animate-slide-in-left">
          <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[85%] shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-sm font-bold text-gray-900">Citea Assistant</span>
              <span className="ml-auto text-xs text-gray-400">Just now</span>
            </div>
            <p className="text-sm text-gray-800 mb-3 leading-relaxed">
              For APA format with multiple authors:
            </p>
            <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-100">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>1-2 authors:</strong> List all names</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>3-20 authors:</strong> List all names</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>21+ authors:</strong> First 19 + "..." + last author</span>
                </li>
              </ul>
            </div>
            <div className="pt-3 border-t border-gray-200 bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 font-medium mb-1">Example:</p>
              <p className="text-xs text-gray-700 italic">
                Smith, J., Johnson, M., & Williams, K. (2023). Research methods. <em>Journal Name</em>, 15(2), 123-145.
              </p>
            </div>
          </div>
          </div>
        )}

        {/* User Follow-up */}
        {showSecondMessage && (
          <div className="flex justify-end animate-slide-in-right">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[70%] shadow-md">
              <p className="text-sm">Can you verify this citation for me?</p>
            </div>
          </div>
        )}

        {/* AI Typing Indicator */}
        {showTyping && (
          <div className="flex justify-start animate-slide-in-left">
            <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask me anything about citations..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm bg-white focus:border-purple-500 transition-colors"
          readOnly
        />
        <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3 rounded-xl hover:shadow-lg transition-all">
          <span className="text-xl">📤</span>
        </button>
      </div>
    </div>
  )
}
