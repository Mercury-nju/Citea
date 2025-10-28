'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  [
    {
      question: "How accurate is Citea's citation verification?",
      answer: "Citea uses AI-powered verification against authoritative academic databases like CrossRef and PubMed, achieving over 95% accuracy in detecting authentic vs. fabricated citations."
    },
    {
      question: "What citation formats does Citea support?",
      answer: "Citea supports all major citation styles including APA, MLA, Chicago, Harvard, IEEE, and many others, with automatic formatting and style conversion."
    },
    {
      question: "Can I use Citea for collaborative research projects?",
      answer: "Yes! Citea supports team collaboration with shared citation libraries, verification reports, and the ability to export verified citations for group projects."
    }
  ],
  [
    {
      question: "What academic databases does Citea search?",
      answer: "We integrate with major databases including CrossRef, PubMed, arXiv, Google Scholar, and other discipline-specific repositories to provide comprehensive source verification."
    },
    {
      question: "Is my research data secure with Citea?",
      answer: "Absolutely. Your research data is encrypted and stored securely. We never share your work with third parties, and you maintain full ownership of your content."
    },
    {
      question: "Is Citea really completely free?",
      answer: "Yes! Unlike other services, Citea is 100% free with no limits, no subscriptions, and no hidden fees. We believe academic integrity tools should be accessible to everyone."
    }
  ],
  [
    {
      question: "Can Citea help me find new sources for my research?",
      answer: "Yes! Citea's AI can suggest relevant, peer-reviewed sources based on your research topic and automatically verify their authenticity before you use them."
    },
    {
      question: "How does Citea detect AI-generated fake citations?",
      answer: "Our advanced algorithms cross-reference citations against multiple authoritative databases and use pattern recognition to identify inconsistencies typical of fabricated references."
    },
    {
      question: "Does Citea work with reference management software?",
      answer: "Yes! Citea integrates with popular tools like Zotero, Mendeley, and EndNote, allowing you to import and verify your existing citation libraries."
    }
  ]
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition flex justify-between items-center"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about citation verification? Find answers to common questions about Citea's research tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {faqs.map((column, colIndex) => (
            <div key={colIndex} className="space-y-4">
              {column.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

