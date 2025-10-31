'use client'

import { Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Pricing() {
  const { t } = useLanguage()

  const features = [
    t.pricing.features.unlimited,
    t.pricing.features.sourceFinding,
    t.pricing.features.aiVerification,
    t.pricing.features.databases,
    t.pricing.features.chatAssistant,
    t.pricing.features.formats,
    t.pricing.features.realtime,
    t.pricing.features.export,
    t.pricing.features.support,
    t.pricing.features.noLimits,
    t.pricing.features.noRestrictions,
  ]

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.pricing.title}{' '}
            <span className="text-green-600">{t.pricing.freeAccess}</span>
            {' '}{t.pricing.forEveryone}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white p-10 rounded-3xl border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                🎉 {t.pricing.freeAccess.toUpperCase()}
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{t.pricing.planTitle}</h3>
              <div className="text-6xl font-bold text-gray-900 mb-2">{t.pricing.price}</div>
              <p className="text-gray-600 text-lg">{t.pricing.subtitle}</p>
            </div>

            <ul className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-lg">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="#tools"
              className="block w-full bg-gray-900 text-white text-center px-8 py-5 rounded-xl hover:bg-gray-800 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {t.pricing.cta}
            </a>

            <p className="text-center text-gray-600 mt-6 text-sm">
              {t.pricing.noRegistration}
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            {t.pricing.contact}{' '}
            <a href="mailto:support@citea.com" className="text-lime-600 hover:underline font-medium">
              support@citea.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
