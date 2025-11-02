'use client'

import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import DatabaseLogos from './DatabaseLogos'

export default function Hero() {
  const { t } = useLanguage()
  
  return (
    <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          {t.hero.title1}
          <br />
          <span className="relative inline-block text-blue-600">
            {t.hero.title2}
            {/* Wavy Underline SVG */}
            <svg 
              className="absolute left-0 right-0 -bottom-2 w-full" 
              viewBox="0 0 400 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path 
                d="M0 6C20 2, 40 10, 60 6C80 2, 100 10, 120 6C140 2, 160 10, 180 6C200 2, 220 10, 240 6C260 2, 280 10, 300 6C320 2, 340 10, 360 6C380 2, 400 10, 400 6" 
                stroke="#93C5FD" 
                strokeWidth="3" 
                strokeLinecap="round"
                className="animate-wave"
              />
            </svg>
          </span>
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
