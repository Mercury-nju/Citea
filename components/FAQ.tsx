'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface FAQItemData {
  question: string
  answer: string
}

type FAQColumn = FAQItemData[]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left hover:bg-gray-50 transition flex justify-between items-center group"
      >
        <span className="font-semibold text-gray-900 text-lg pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQ() {
  const { t } = useLanguage()
  
  // Safely get FAQ items with proper type checking
  let faqs: FAQColumn[] = []
  try {
    const items = t.faq?.items
    if (items && Array.isArray(items) && items.length > 0) {
      // Validate that items is a 2D array structure
      const isValidStructure = items.every(col => Array.isArray(col) && col.length > 0)
      if (isValidStructure) {
        faqs = items as FAQColumn[]
      } else {
        // If structure is invalid, try to fix it or log for debugging
        console.warn('FAQ items structure is invalid:', items)
      }
    }
  } catch (error) {
    console.error('Error loading FAQ items:', error)
    faqs = []
  }

  // If no FAQs available, show empty state
  if (!faqs || faqs.length === 0 || faqs.every(col => !col || col.length === 0)) {
    return (
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.faq?.title || 'Frequently asked questions'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.faq?.subtitle || 'Have questions about Citea? Find answers to common questions.'}
            </p>
          </div>
          <div className="text-center text-gray-500">
            <p>FAQ content is being updated. Please check back soon.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.faq?.title || 'Frequently asked questions'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.faq?.subtitle || 'Have questions about Citea? Find answers to common questions.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {faqs.map((column: FAQColumn, colIndex: number) => {
            if (!Array.isArray(column)) return null
            return (
              <div key={colIndex} className="space-y-4">
                {column.map((faq: FAQItemData, index: number) => {
                  if (!faq || !faq.question || !faq.answer) return null
                  return (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
