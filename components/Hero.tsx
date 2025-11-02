'use client'

import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import DatabaseLogos from './DatabaseLogos'

export default function Hero() {
  const { t } = useLanguage()
  
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in">
          {t.hero.title1}
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
            {/* Modern gradient highlight */}
            <span className="absolute left-0 right-0 bottom-2 h-4 bg-gradient-to-r from-blue-200/40 via-blue-300/50 to-blue-400/40 rounded-lg blur-sm -z-0 transform -skew-x-12"></span>
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-150">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in delay-300">
          <Link
            href="/auth/signin"
            className="group relative bg-gradient-to-r from-gray-900 to-gray-800 text-white px-10 py-4 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t.hero.findSources}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
          <Link
            href="/auth/signin"
            className="group bg-white text-gray-900 border-2 border-gray-200 px-10 py-4 rounded-xl hover:border-blue-300 hover:shadow-lg hover:bg-gray-50 transition-all text-lg font-semibold transform hover:-translate-y-0.5"
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
