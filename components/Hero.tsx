'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import DatabaseLogos from './DatabaseLogos'

export default function Hero() {
  const { t } = useLanguage()
  const [displayedText1, setDisplayedText1] = useState('')
  const [displayedText2, setDisplayedText2] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [phase, setPhase] = useState<'text1' | 'text2' | 'complete'>('text1')
  
  const fullText1 = t.hero.title1
  const fullText2 = t.hero.title2

  useEffect(() => {
    // 光标闪烁效果
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    // 第一阶段：打字第一个标题
    if (phase === 'text1' && displayedText1.length < fullText1.length) {
      const timer = setTimeout(() => {
        setDisplayedText1(fullText1.slice(0, displayedText1.length + 1))
      }, 80) // 每个字符 80ms
      
      return () => clearTimeout(timer)
    } else if (phase === 'text1' && displayedText1.length === fullText1.length) {
      // 第一个标题完成，等待一下然后开始第二个
      const timer = setTimeout(() => {
        setPhase('text2')
        setDisplayedText2('')
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [displayedText1, fullText1, phase])

  useEffect(() => {
    // 第二阶段：打字第二个标题
    if (phase === 'text2' && displayedText2.length < fullText2.length) {
      const timer = setTimeout(() => {
        setDisplayedText2(fullText2.slice(0, displayedText2.length + 1))
      }, 80)
      
      return () => clearTimeout(timer)
    } else if (phase === 'text2' && displayedText2.length === fullText2.length) {
      // 完成后隐藏光标
      const timer = setTimeout(() => {
        setPhase('complete')
        setShowCursor(false)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [displayedText2, fullText2, phase])
  
  return (
    <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Heading with Typewriter Effect */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight min-h-[200px] md:min-h-[240px] lg:min-h-[280px]">
          <div className="inline-block">
            {displayedText1 || '\u00A0'}
            {phase === 'text1' && (
              <span 
                className={`inline-block w-[2px] h-[1em] align-middle ml-1 ${showCursor ? 'bg-gray-900' : 'bg-transparent'}`} 
                style={{ animation: showCursor ? 'blink 1s infinite' : 'none' }} 
              />
            )}
          </div>
          {(phase === 'text2' || phase === 'complete') && (
            <>
              <br />
              <span className="relative inline-block text-blue-600">
                {displayedText2 || '\u00A0'}
                {phase === 'text2' && (
                  <span 
                    className={`inline-block w-[2px] h-[1em] align-middle ml-1 ${showCursor ? 'bg-blue-600' : 'bg-transparent'}`} 
                    style={{ animation: showCursor ? 'blink 1s infinite' : 'none' }} 
                  />
                )}
                {/* Wavy Underline SVG - 只在完成时显示 */}
                {phase === 'complete' && (
                  <svg 
                    className="absolute left-0 right-0 -bottom-2 w-full animate-fade-in" 
                    viewBox="0 0 400 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    style={{ animation: 'fadeIn 0.5s ease-in' }}
                  >
                    <path 
                      d="M0 6C20 2, 40 10, 60 6C80 2, 100 10, 120 6C140 2, 160 10, 180 6C200 2, 220 10, 240 6C260 2, 280 10, 300 6C320 2, 340 10, 360 6C380 2, 400 10, 400 6" 
                      stroke="#93C5FD" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      className="animate-wave"
                    />
                  </svg>
                )}
              </span>
            </>
          )}
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            href="/auth/signin"
            className="group bg-gray-900 text-white px-10 py-4 rounded-xl hover:bg-gray-800 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {t.hero.findSources}
          </Link>
          <Link
            href="/auth/signin"
            className="group bg-white text-gray-900 border-2 border-gray-200 px-10 py-4 rounded-xl hover:border-gray-300 hover:shadow-md transition-all text-lg font-semibold"
          >
            {t.hero.checkCitations}
          </Link>
        </div>

        {/* Watch Demo */}
        <button 
          onClick={() => {
            const toolsSection = document.getElementById('tools')
            toolsSection?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="text-gray-600 hover:text-gray-900 transition flex items-center gap-2 mx-auto group mb-16"
        >
          <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-gray-100 transition">
            <Play size={14} className="fill-current ml-0.5" />
          </div>
          <span className="text-base font-medium">{t.hero.watchDemo}</span>
        </button>

        {/* Database Integration */}
        <div className="mt-16">
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-medium">
            {t.hero.databases}
          </p>
          <DatabaseLogos />
        </div>
      </div>
    </section>
  )
}
