'use client'

import { useState } from 'react'
import { Check, X, Zap } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PricingPage() {
  const { t, language } = useLanguage()
  const isChinese = language === 'zh'

  const plans = [
    {
      id: 'free',
      name: isChinese ? '免费版' : 'Free',
      price: isChinese ? '免费' : 'Free',
      period: '',
      credits: isChinese ? '每天3积分' : '3 credits/day',
      wordLimit: '300',
      features: [
        isChinese ? '每天3积分' : '3 credits per day',
        isChinese ? '最多300字输入' : 'Up to 300 characters',
        isChinese ? '基础数据库（CrossRef、Semantic Scholar）' : 'Basic databases (CrossRef, Semantic Scholar)',
        isChinese ? '无法使用对话功能' : 'No chat access',
      ],
      limitations: [
        isChinese ? '无法使用专业数据库' : 'No access to advanced databases',
        isChinese ? '无法使用对话功能' : 'No chat feature',
      ],
      buttonText: isChinese ? '立即使用' : 'Get Started',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800',
      popular: false
    },
    {
      id: 'weekly',
      name: isChinese ? '周费' : 'Weekly',
      price: isChinese ? '¥35' : '$4.9',
      period: isChinese ? '/周' : '/week',
      credits: isChinese ? '每周35积分' : '35 credits/week',
      wordLimit: '1000',
      features: [
        isChinese ? '每周35积分' : '35 credits per week',
        isChinese ? '最多1000字输入' : 'Up to 1000 characters',
        isChinese ? '专业数据库访问' : 'Advanced databases access',
        isChinese ? '可使用对话功能' : 'Chat feature available',
        isChinese ? '更快分析速度' : 'Faster analysis speed',
      ],
      limitations: [],
      buttonText: isChinese ? '立即订阅' : 'Subscribe Now',
      buttonStyle: 'bg-green-600 hover:bg-green-700',
      popular: false
    },
    {
      id: 'monthly',
      name: isChinese ? '月费' : 'Monthly',
      price: isChinese ? '¥92' : '$12.9',
      period: isChinese ? '/月' : '/month',
      credits: isChinese ? '每月150积分' : '150 credits/month',
      wordLimit: '1000',
      features: [
        isChinese ? '每月150积分' : '150 credits per month',
        isChinese ? '最多1000字输入' : 'Up to 1000 characters',
        isChinese ? '专业数据库访问' : 'Advanced databases access',
        isChinese ? '可使用对话功能' : 'Chat feature available',
        isChinese ? '更快分析速度' : 'Faster analysis speed',
      ],
      limitations: [],
      buttonText: isChinese ? '立即订阅' : 'Subscribe Now',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700',
      popular: true
    },
    {
      id: 'yearly',
      name: isChinese ? '年费' : 'Yearly',
      price: isChinese ? '¥640' : '$89.9',
      period: isChinese ? '/年' : '/year',
      credits: isChinese ? '3000积分' : '3000 credits',
      wordLimit: '1000',
      features: [
        isChinese ? '3000积分' : '3000 credits',
        isChinese ? '最多1000字输入' : 'Up to 1000 characters',
        isChinese ? '专业数据库访问' : 'Advanced databases access',
        isChinese ? '可使用对话功能' : 'Chat feature available',
        isChinese ? '更快分析速度' : 'Faster analysis speed',
      ],
      limitations: [],
      buttonText: isChinese ? '立即订阅' : 'Subscribe Now',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700',
      popular: false
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {isChinese ? '选择适合您的方案' : 'Choose Your Plan'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isChinese 
                ? '每次文献分析、引文验证或对话都会消耗1积分。升级到付费方案可享受更多功能和专业数据库访问。'
                : 'Each source finding, citation verification, or chat consumes 1 credit. Upgrade to paid plans for more features and advanced database access.'}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-8 transition-all ${
                  plan.popular
                    ? 'border-blue-500 shadow-xl scale-105'
                    : 'border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      {isChinese ? '最受欢迎' : 'Most Popular'}
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
                    // TODO: 集成支付平台
                    if (plan.id === 'free') {
                      window.location.href = '/auth/signup'
                    } else {
                      alert(isChinese ? '支付功能即将上线' : 'Payment coming soon')
                    }
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* Credit Usage Info */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {isChinese ? '积分使用说明' : 'Credit Usage'}
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {isChinese ? '每次操作消耗1积分：' : 'Each operation consumes 1 credit:'}
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• {isChinese ? '文献分析' : 'Source Finding'}</li>
                    <li>• {isChinese ? '引文验证' : 'Citation Verification'}</li>
                    <li>• {isChinese ? 'AI对话' : 'AI Chat'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {isChinese ? '功能对比' : 'Feature Comparison'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">
                      {isChinese ? '功能' : 'Feature'}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">
                      {isChinese ? '免费版' : 'Free'}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">
                      {isChinese ? '付费版' : 'Paid'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">{isChinese ? '积分/周期' : 'Credits/Period'}</td>
                    <td className="text-center py-4 px-4">3/天</td>
                    <td className="text-center py-4 px-4">
                      {isChinese ? '35/周，150/月，3000/年' : '35/week, 150/month, 3000/year'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">{isChinese ? '字数限制' : 'Character Limit'}</td>
                    <td className="text-center py-4 px-4">300</td>
                    <td className="text-center py-4 px-4">1000</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">{isChinese ? '数据库' : 'Databases'}</td>
                    <td className="text-center py-4 px-4">
                      {isChinese ? '基础（CrossRef、Semantic Scholar）' : 'Basic (CrossRef, Semantic Scholar)'}
                    </td>
                    <td className="text-center py-4 px-4">
                      {isChinese ? '专业（包括PubMed、arXiv）' : 'Advanced (PubMed, arXiv)'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">{isChinese ? '对话功能' : 'Chat Feature'}</td>
                    <td className="text-center py-4 px-4">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">{isChinese ? '分析速度' : 'Analysis Speed'}</td>
                    <td className="text-center py-4 px-4">{isChinese ? '标准' : 'Standard'}</td>
                    <td className="text-center py-4 px-4">{isChinese ? '更快' : 'Faster'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

