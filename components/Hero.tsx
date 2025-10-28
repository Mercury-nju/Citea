'use client'

import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Hero() {
  const { t } = useLanguage()
  
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
          {t.hero.title1}
          <br />
          <span className="text-primary-600">{t.hero.title2}</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {t.hero.subtitle}{' '}
          <span className="font-bold text-green-600">{t.hero.free}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="#tools"
            className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition text-lg font-semibold flex items-center gap-2"
          >
            {t.hero.findSources}
            <ArrowRight size={20} />
          </Link>
          <Link
            href="#tools"
            className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg hover:bg-primary-50 transition text-lg font-semibold flex items-center gap-2"
          >
            {t.hero.checkCitations}
            <ArrowRight size={20} />
          </Link>
        </div>

        <button 
          onClick={() => {
            const toolsSection = document.getElementById('tools')
            toolsSection?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="text-primary-600 hover:text-primary-700 transition flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Play size={24} className="fill-current" />
          <span className="text-lg">{t.hero.watchDemo}</span>
        </button>

        {/* Database Integration Icons */}
        <div className="mt-16">
          <p className="text-gray-500 mb-6">{t.hero.databases}</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="text-gray-400 font-semibold">arXiv</div>
            <div className="text-gray-400 font-semibold">CrossRef</div>
            <div className="text-gray-400 font-semibold">OpenAlex</div>
            <div className="text-gray-400 font-semibold">PubMed</div>
            <div className="text-gray-400 font-semibold">Semantic Scholar</div>
          </div>
        </div>
      </div>
    </section>
  )
}

