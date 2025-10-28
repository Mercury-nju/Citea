'use client'

import { Search, CheckCircle, MessageSquare } from 'lucide-react'

const detailedFeatures = [
  {
    icon: Search,
    title: 'Source Finder',
    subtitle: 'Find credible academic sources for your research topics automatically.',
    description: 'Advanced search algorithms help you discover relevant, peer-reviewed sources from trusted academic databases, saving hours of manual research.'
  },
  {
    icon: CheckCircle,
    title: 'Citation Checker',
    subtitle: 'Instantly verify the authenticity of academic references and citations.',
    description: 'Our AI-powered system cross-references citations against authoritative academic databases to ensure every source is legitimate and properly attributed.'
  },
  {
    icon: MessageSquare,
    title: 'Research Assistant',
    subtitle: 'AI-powered chat assistant for citation verification and source analysis.',
    description: 'Ask questions about your references, verify citation details, and get real-time guidance on source authenticity. Our AI assistant helps you maintain academic integrity throughout your research process.'
  }
]

export default function DetailedFeatures() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need for reliable research.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive citation verification and source validation tools to ensure your academic work meets the highest standards.
          </p>
        </div>

        <div className="space-y-12">
          {detailedFeatures.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } gap-8 items-center`}
            >
              <div className="flex-1">
                <feature.icon className="w-16 h-16 text-primary-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-lg text-gray-700 font-semibold mb-2">{feature.subtitle}</p>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
              <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-24 h-24 text-primary-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

