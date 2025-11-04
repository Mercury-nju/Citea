'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PrivacyPage() {
  const { t } = useLanguage()
  
  const renderListItems = (items: string) => {
    return items.split(',').map((item, idx) => (
      <li key={idx} className="text-gray-700">{item.trim()}</li>
    ))
  }
  
  const renderListItemsWithBold = (items: string) => {
    return items.split(',').map((item, idx) => {
      const parts = item.trim().split(':')
      if (parts.length === 2) {
        return (
          <li key={idx} className="text-gray-700">
            <strong>{parts[0].trim()}:</strong>{parts[1].trim()}
          </li>
        )
      }
      return <li key={idx} className="text-gray-700">{item.trim()}</li>
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-block mb-8">
          <Logo />
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t.privacy.title}</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            {t.privacy.lastUpdated}
          </p>
          
          <p className="text-gray-700 mb-6">
            {t.privacy.intro}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section1Title}</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.privacy.section1Account}</h3>
          <p className="text-gray-700 mb-4">
            {t.privacy.section1AccountDesc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.privacy.section1AccountItems)}
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.privacy.section1Usage}</h3>
          <p className="text-gray-700 mb-4">
            {t.privacy.section1UsageDesc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.privacy.section1UsageItems)}
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.privacy.section1Payment}</h3>
          <p className="text-gray-700 mb-4">
            {t.privacy.section1PaymentDesc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.privacy.section1PaymentItems)}
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section2Title}</h2>
          <p className="text-gray-700 mb-4">{t.privacy.section2Desc}</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.privacy.section2Items)}
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section3Title}</h2>
          <p className="text-gray-700 mb-4">{t.privacy.section3Desc}</p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.privacy.section3Providers}</h3>
          <p className="text-gray-700 mb-4">
            {t.privacy.section3ProvidersDesc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItemsWithBold(t.privacy.section3ProvidersItems)}
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.privacy.section3Legal}</h3>
          <p className="text-gray-700 mb-4">
            {t.privacy.section3LegalDesc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section4Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.privacy.section4Desc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.privacy.section4Items)}
          </ul>
          <p className="text-gray-700 mb-4">
            {t.privacy.section4Note}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section5Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.privacy.section5Desc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.privacy.section5Items)}
          </ul>
          <p className="text-gray-700 mb-4">
            {t.privacy.section5Note}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section6Title}</h2>
          <p className="text-gray-700 mb-4">{t.privacy.section6Desc}</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItemsWithBold(t.privacy.section6Items)}
          </ul>
          <p className="text-gray-700 mb-4">
            {t.privacy.section6Contact}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section7Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.privacy.section7Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section8Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.privacy.section8Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section9Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.privacy.section9Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section10Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.privacy.section10Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.privacy.section11Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.privacy.section11Desc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.privacy.section11Items)}
          </ul>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            {t.privacy.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
