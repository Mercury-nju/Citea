'use client'

import { Check } from 'lucide-react'

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get your research to a new level with{' '}
            <span className="text-green-600">Free Access</span>, for everyone.
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl border-4 border-green-400 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                🎉 COMPLETELY FREE FOREVER
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Free for Everyone</h3>
              <div className="text-5xl font-bold text-green-600 mb-2">$0</div>
              <p className="text-gray-600">No credit card required. No hidden fees.</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Unlimited citation checks',
                'Unlimited source finding',
                'Advanced AI verification',
                'Access to all academic databases',
                'AI Research Assistant chat',
                'All citation formats (APA, MLA, Chicago, etc.)',
                'Real-time verification',
                'Citation export functionality',
                'Email support',
                'No character limits',
                'No usage restrictions'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="#tools"
              className="block w-full bg-green-600 text-white text-center px-8 py-4 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
            >
              Start Using Citea Free
            </a>

            <p className="text-center text-gray-600 mt-6">
              ✨ No registration required to start
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Questions about our free service? Contact us at{' '}
            <a href="mailto:support@citea.com" className="text-primary-600 hover:underline">
              support@citea.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

