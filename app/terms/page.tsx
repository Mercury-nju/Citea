'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import { useLanguage } from '@/contexts/LanguageContext'

export default function TermsPage() {
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
        
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t.terms.title}</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            {t.terms.lastUpdated}
          </p>
          
          <p className="text-gray-700 mb-6">
            {t.terms.intro}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section1Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section1Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section2Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section2Desc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItemsWithBold(t.terms.section2Items)}
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section3Title}</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.terms.section3Registration}</h3>
          <p className="text-gray-700 mb-4">
            {t.terms.section3RegistrationDesc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.terms.section3RegistrationItems)}
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.terms.section3Age}</h3>
          <p className="text-gray-700 mb-4">
            {t.terms.section3AgeDesc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section4Title}</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.terms.section4Plans}</h3>
          <p className="text-gray-700 mb-4">
            {t.terms.section4PlansDesc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItemsWithBold(t.terms.section4PlansItems)}
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.terms.section4Payment}</h3>
          <p className="text-gray-700 mb-4">
            {t.terms.section4PaymentDesc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.terms.section4PaymentItems)}
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.terms.section4Renewal}</h3>
          <p className="text-gray-700 mb-4">
            {t.terms.section4RenewalDesc}
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.terms.section4Refund}</h3>
          <p className="text-gray-700 mb-4">
            {t.terms.section4RefundDesc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.terms.section4RefundItems)}
          </ul>
          <p className="text-gray-700 mb-4">
            {t.terms.section4RefundNote}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section5Title}</h2>
          <p className="text-gray-700 mb-4">{t.terms.section5Desc}</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.terms.section5Items)}
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section6Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section6Desc}
          </p>
          <p className="text-gray-700 mb-4">
            {t.terms.section6User}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section7Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section7Desc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.terms.section7Items)}
          </ul>
          <p className="text-gray-700 mb-4">
            {t.terms.section7Note}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section8Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section8Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section9Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section9Desc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.terms.section9Items)}
          </ul>
          <p className="text-gray-700 mb-4">
            {t.terms.section9Note}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section10Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section10Desc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.terms.section10Items)}
          </ul>
          <p className="text-gray-700 mb-4">
            {t.terms.section10Limit}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section11Title}</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.terms.section11User}</h3>
          <p className="text-gray-700 mb-4">
            {t.terms.section11UserDesc}
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{t.terms.section11We}</h3>
          <p className="text-gray-700 mb-4">
            {t.terms.section11WeDesc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section12Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section12Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section13Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section13Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section14Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section14Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section15Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section15Desc}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.terms.section16Title}</h2>
          <p className="text-gray-700 mb-4">
            {t.terms.section16Desc}
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {renderListItems(t.terms.section16Items)}
          </ul>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            {t.terms.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
