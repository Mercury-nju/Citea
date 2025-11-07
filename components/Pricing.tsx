'use client'

import { useState, useRef } from 'react'
import { Check, X, Sparkles, Zap, Crown, LucideIcon } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Plan {
  id: string
  name: string
  price: string
  period: string
  credits: string
  wordLimit: string
  icon: LucideIcon
  gradient: string
  features: string[]
  limitations: string[]
  buttonText: string
  buttonStyle: string
  popular: boolean
}

export default function Pricing() {
  const { t } = useLanguage()

  const plans: Plan[] = [
    {
      id: 'free',
      name: t.pricing.freePlan,
      price: t.pricing.free,
      period: '',
      credits: t.pricing.freeCredits,
      wordLimit: '1000',
      icon: Sparkles,
      gradient: 'from-gray-50 to-gray-100',
      features: [
        t.pricing.creditsPerDay,
        t.pricing.upTo1000Chars,
        t.pricing.basicDatabases,
        t.pricing.aiDocGeneration,
      ],
      limitations: [
        t.pricing.noAdvancedDatabases,
        t.pricing.noChatFeature,
      ],
      buttonText: t.pricing.getStarted,
      buttonStyle: 'bg-gray-900 hover:bg-gray-800',
      popular: false
    },
    {
      id: 'monthly',
      name: t.pricing.monthlyPlan,
      price: '$12.9',
      period: t.pricing.perMonth,
      credits: t.pricing.monthlyCredits,
      wordLimit: '1000',
      icon: Zap,
      gradient: 'from-blue-50 to-indigo-50',
      features: [
        t.pricing.creditsPerMonth,
        t.pricing.upTo1000Chars,
        t.pricing.advancedDatabases,
        t.pricing.aiDocGeneration,
        t.pricing.chatAvailable,
        t.pricing.fasterSpeed,
      ],
      limitations: [],
      buttonText: t.pricing.subscribeNow,
      buttonStyle: 'bg-blue-600 hover:bg-blue-700',
      popular: true
    },
    {
      id: 'yearly',
      name: t.pricing.yearlyPlan,
      price: '$89.9',
      period: t.pricing.perYear,
      credits: t.pricing.yearlyCredits,
      wordLimit: '1000',
      icon: Crown,
      gradient: 'from-purple-50 to-pink-50',
      features: [
        t.pricing.yearlyCredits,
        t.pricing.upTo1000Chars,
        t.pricing.advancedDatabases,
        t.pricing.aiDocGeneration,
        t.pricing.chatAvailable,
        t.pricing.fasterSpeed,
      ],
      limitations: [],
      buttonText: t.pricing.subscribeNow,
      buttonStyle: 'bg-purple-600 hover:bg-purple-700',
      popular: false
    },
  ]

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t.pricing.choosePlan}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.pricing.planDescription}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            
            return (
              <PricingCardItem
                key={plan.id}
                plan={plan}
                IconComponent={IconComponent}
                t={t}
              />
            )
          })}
        </div>
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {t.pricing.mostPopular}
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-6 pb-6 border-b border-gray-100">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-3">
                      <IconComponent className={`w-6 h-6 ${
                        plan.id === 'free' ? 'text-gray-600' :
                        plan.id === 'monthly' ? 'text-blue-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-500 text-base">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{plan.credits}</p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400 text-sm line-through">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full ${plan.buttonStyle} text-white py-3 px-6 rounded-lg font-medium transition-all`}
                    onClick={async () => {
                      if (plan.id === 'free') {
                        window.location.href = '/auth/signup'
                      } else {
                        const targetPlan = plan.id === 'yearly' ? 'yearly' : 'monthly'
                        // Try to get user email from localStorage
                        try {
                          const savedUser = localStorage.getItem('citea_user')
                          if (savedUser) {
                            const user = JSON.parse(savedUser)
                            if (user.email) {
                              window.location.href = `/api/creem/checkout?plan=${targetPlan}&email=${encodeURIComponent(user.email)}`
                              return
                            }
                          }
                        } catch (e) {
                          console.error('Error getting user email:', e)
                        }
                        // Fallback without email
                        window.location.href = `/api/creem/checkout?plan=${targetPlan}`
                      }
                    }}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Credit Usage Info */}
        <div className="bg-gray-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {t.pricing.creditUsage}
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">
                  {t.pricing.creditUsageDesc}
                </p>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• {t.pricing.sourceFinding}</li>
                  <li>• {t.pricing.citationVerification}</li>
                  <li>• {t.pricing.aiChat}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t.pricing.featureComparison}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">
                      {t.pricing.feature}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">
                      {t.pricing.freePlan}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">
                      {t.pricing.paidPlan}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">{t.pricing.creditsPeriod}</td>
                    <td className="text-center py-4 px-4">{t.pricing.creditsPeriodFree}</td>
                    <td className="text-center py-4 px-4">
                      {t.pricing.creditsPeriodPaid}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">{t.pricing.characterLimit}</td>
                    <td className="text-center py-4 px-4">1000</td>
                    <td className="text-center py-4 px-4">1000</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">{t.pricing.databases}</td>
                    <td className="text-center py-4 px-4">
                      {t.pricing.databasesBasic}
                    </td>
                    <td className="text-center py-4 px-4">
                      {t.pricing.databasesAdvanced}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">{t.pricing.chatFeature}</td>
                    <td className="text-center py-4 px-4">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">{t.pricing.analysisSpeed}</td>
                    <td className="text-center py-4 px-4">{t.pricing.standard}</td>
                    <td className="text-center py-4 px-4">{t.pricing.faster}</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </section>
  )
}

function PricingCardItem({ plan, IconComponent, t }: { plan: Plan; IconComponent: LucideIcon; t: any }) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-white rounded-xl border transition-all duration-300 ${
        plan.popular
          ? 'border-blue-600 shadow-xl scale-105'
          : 'border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300'
      } ${
        isHovered && !plan.popular
          ? 'scale-105 border-blue-300 -translate-y-2'
          : ''
      }`}
      style={{
        transform: isHovered && !plan.popular 
          ? 'scale(1.05) translateY(-8px)' 
          : plan.popular 
          ? 'scale(1.05)' 
          : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {t.pricing.mostPopular}
          </span>
        </div>
      )}

      {/* Card Content */}
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6 pb-6 border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-3">
            <IconComponent className={`w-6 h-6 ${
              plan.id === 'free' ? 'text-gray-600' :
              plan.id === 'monthly' ? 'text-blue-600' :
              'text-purple-600'
            }`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
            {plan.period && (
              <span className="text-gray-500 text-base">{plan.period}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">{plan.credits}</p>
        </div>

        {/* Features List */}
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
          {plan.limitations.map((limitation, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-400 text-sm line-through">{limitation}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          className={`w-full ${plan.buttonStyle} text-white py-3 px-6 rounded-lg font-medium transition-all`}
          onClick={async () => {
            if (plan.id === 'free') {
              window.location.href = '/auth/signup'
            } else {
              const targetPlan = plan.id === 'yearly' ? 'yearly' : 'monthly'
              // Try to get user email from localStorage
              try {
                const savedUser = localStorage.getItem('citea_user')
                if (savedUser) {
                  const user = JSON.parse(savedUser)
                  if (user.email) {
                    window.location.href = `/api/creem/checkout?plan=${targetPlan}&email=${encodeURIComponent(user.email)}`
                    return
                  }
                }
              } catch (e) {
                console.error('Error getting user email:', e)
              }
              // Fallback without email
              window.location.href = `/api/creem/checkout?plan=${targetPlan}`
            }
          }}
        >
          {plan.buttonText}
        </button>
      </div>
    </div>
  )
}
