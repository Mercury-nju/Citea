'use client'

import { Play, ListChecks, MessageSquare, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import DatabaseLogos from './DatabaseLogos'

export default function Hero() {
  const { t } = useLanguage()
  const workflow = t.hero.workflow || {}
  const workflowItems = [
    {
      icon: ListChecks,
      title: workflow.outline?.title || 'Outline with prompts',
      description: workflow.outline?.description || 'Turn a rough topic into a detailed structure in seconds.'
    },
    {
      icon: MessageSquare,
      title: workflow.assistant?.title || 'Draft with AI assistant',
      description: workflow.assistant?.description || 'Expand each section, adjust tone, and iterate without leaving the editor.'
    },
    {
      icon: ShieldCheck,
      title: workflow.verify?.title || 'Verify citations automatically',
      description: workflow.verify?.description || 'Trace every reference with Find Source and run citation checks to remove hallucinations.'
    }
  ]
  
  return (
    <section className="relative pt-48 pb-40 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
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
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center mb-8">
          <Link
            href="/auth/signin"
            className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-lg transition-all text-lg font-semibold shadow-lg hover:shadow-xl mb-6"
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

        {/* Workflow Highlights */}
        <div className="mt-14">
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4">
            {t.hero.workflowTitle}
          </p>
          <div className="grid gap-4 md:grid-cols-3 text-left">
            {workflowItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="h-full rounded-2xl border border-blue-100 bg-blue-50/40 p-6 backdrop-blur-sm">
                  <div className="inline-flex items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 p-3 mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Database Integration */}
        <div className="mt-20">
          <p className="text-base text-gray-600 mb-8 font-medium">
            {t.hero.databases}
          </p>
          <DatabaseLogos />
        </div>
      </div>
    </section>
  )
}
