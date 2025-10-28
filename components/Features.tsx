'use client'

import { Search, CheckCircle, MessageSquare } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'AI Source Finder',
    description: 'Find original source of citation instantly. Direct integration with major academic databases including CrossRef, PubMed, arXiv, and Google Scholar for comprehensive source validation.',
    image: '📚'
  },
  {
    icon: CheckCircle,
    title: 'Citation Checker Online',
    description: 'Check fake citations and verify reference authenticity. Advanced AI algorithms analyze your text and automatically identify citations that need verification.',
    image: '✓'
  },
  {
    icon: MessageSquare,
    title: 'AI Research Assistant',
    description: 'Chat with our AI assistant about your research questions, citation verification, and source validation. Get instant guidance on reference authenticity and maintain academic integrity in real-time.',
    image: '💬'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful citation tools for serious researchers.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced features to streamline your research workflow and maintain academic integrity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-6xl mb-4">{feature.image}</div>
              <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

