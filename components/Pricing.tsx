'use client'

import { useState } from 'react'
import { Check, X, Zap } from 'lucide-react'
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border-2 p-8 transition-all ${
                plan.popular
                  ? 'border-blue-500 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {t.pricing.mostPopular}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.credits}</p>
              </div>

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
                    <span className="text-gray-500 text-sm line-through">{limitation}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full ${plan.buttonStyle} text-white py-3 px-6 rounded-xl font-semibold transition-all`}
                onClick={() => {
                  if (plan.id === 'free') {
                    window.location.href = '/auth/signup'
                  } else {
                    // 调用后端创建 Creem 结账并跳转（按产品ID区分月/年费）
                    const targetPlan = plan.id === 'yearly' ? 'yearly' : 'monthly'
                    window.location.href = `/api/creem/checkout?plan=${targetPlan}`
                  }
                }}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
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
