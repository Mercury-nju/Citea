'use client'

import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import DatabaseLogos from './DatabaseLogos'

export default function Hero() {
  const { t } = useLanguage()
  
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          <span className="text-gray-900">{t.hero.title1}</span>
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 text-blue-700">
              {t.hero.title2}
            </span>
            {/* Wavy underline */}
            <svg 
              className="absolute left-0 right-0 bottom-1 h-4 w-full" 
              viewBox="0 0 300 15" 
              preserveAspectRatio="none"
            >
              <path 
                d="M0,8 Q37.5,2 75,8 T150,8 T225,8 T300,8" 
                stroke="#60a5fa" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-base md:text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center mb-6">
          <Link
            href="/auth/signin"
            className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg transition-all text-base font-semibold shadow-sm hover:shadow-md mb-4"
          >
            {t.hero.findSources || '开始'}
          </Link>
          
          {/* Watch Demo */}
          <button 
            onClick={() => {
              const toolsSection = document.getElementById('tools')
              toolsSection?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-gray-600 hover:text-gray-900 transition flex items-center gap-2"
          >
            <Play size={16} className="fill-current" />
            <span className="text-sm font-medium">{t.hero.watchDemo}</span>
          </button>
        </div>

        {/* Database Integration */}
        <div className="mt-16">
          <p className="text-sm text-gray-600 mb-6 font-medium">
            {t.hero.databases}
          </p>
          <DatabaseLogos />
        </div>
      </div>
    </section>
  )
}
