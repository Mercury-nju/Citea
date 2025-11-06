'use client'

import { useState } from 'react'
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Pricing() {
  const { t } = useLanguage()

  const plans = [
    {
      id: 'free',
      name: t.pricing.freePlan,
      price: t.pricing.free,
      period: '',
      credits: t.pricing.freeCredits,
      wordLimit: '300',
      icon: Sparkles,
      gradient: 'from-gray-50 to-gray-100',
      features: [
        t.pricing.creditsPerDay,
        t.pricing.upTo300Chars,
        t.pricing.basicDatabases,
        t.pricing.aiDocGeneration,
      ],
      limitations: [
        t.pricing.noAdvancedDatabases,
        t.pricing.noChatFeature,
      ],
      buttonText: t.pricing.getStarted,
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 shadow-lg',
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
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg',
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
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg',
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl transition-all duration-300 overflow-hidden ${
                  plan.popular
                    ? 'shadow-2xl scale-105 ring-2 ring-blue-500'
                    : 'shadow-lg hover:shadow-xl hover:scale-102'
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`} />
                
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Zap size={12} />
                      {t.pricing.mostPopular}
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="relative bg-white/80 backdrop-blur-sm p-8">
                  {/* Header with Icon */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-md mb-4">
                      <IconComponent className={`w-7 h-7 ${
                        plan.id === 'free' ? 'text-gray-700' :
                        plan.id === 'monthly' ? 'text-blue-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-gray-600 text-lg">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-500">{plan.credits}</p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                          <X className="w-3 h-3 text-red-600" />
                        </div>
                        <span className="text-gray-500 text-sm line-through leading-relaxed">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full ${plan.buttonStyle} text-white py-3.5 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
                    onClick={() => {
                      if (plan.id === 'free') {
                        window.location.href = '/auth/signup'
                      } else {
                        const targetPlan = plan.id === 'yearly' ? 'yearly' : 'monthly'
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
                    <td className="text-center py-4 px-4">300</td>
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
