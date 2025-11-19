"use client"

import { ListChecks, MessageSquare, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const iconMap = {
  outline: ListChecks,
  assistant: MessageSquare,
  verify: ShieldCheck,
}

export default function WorkflowHighlights() {
  const { t } = useLanguage()
  const workflow = t.hero.workflow || {}

  const items = [
    {
      key: 'outline' as const,
      fallbackTitle: 'Outline with prompts',
      fallbackDescription: 'Turn a rough topic into a detailed structure in seconds.'
    },
    {
      key: 'assistant' as const,
      fallbackTitle: 'Draft with AI assistant',
      fallbackDescription: 'Expand each section, adjust tone, and iterate without leaving the editor.'
    },
    {
      key: 'verify' as const,
      fallbackTitle: 'Verify with Find Source + Checker',
      fallbackDescription: 'Run automatic source tracing and citation checks to remove hallucinations.'
    }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-6 text-center">
          {t.hero.workflowTitle}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map(({ key, fallbackTitle, fallbackDescription }) => {
            const Icon = iconMap[key]
            const title = workflow?.[key]?.title || fallbackTitle
            const description = workflow?.[key]?.description || fallbackDescription

            return (
              <div
                key={key}
                className="h-full rounded-3xl border border-blue-100 bg-white shadow-[0_20px_40px_-24px_rgba(30,64,175,0.35)] p-8"
              >
                <div className="inline-flex items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 p-3 mb-5">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

