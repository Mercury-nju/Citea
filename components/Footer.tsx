'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import Logo from './Logo'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V8Z" fill="#3B82F6"/>
                  <path d="M10 12C10 11.4477 10.4477 11 11 11H13C13.5523 11 14 11.4477 14 12V12C14 12.5523 13.5523 13 13 13H11C10.4477 13 10 12.5523 10 12V12Z" fill="white"/>
                  <path d="M10 16C10 15.4477 10.4477 15 11 15H17C17.5523 15 18 15.4477 18 16V16C18 16.5523 17.5523 17 17 17H11C10.4477 17 10 16.5523 10 16V16Z" fill="white"/>
                  <path d="M10 20C10 19.4477 10.4477 19 11 19H21C21.5523 19 22 19.4477 22 20V20C22 20.5523 21.5523 21 21 21H11C10.4477 21 10 20.5523 10 20V20Z" fill="white"/>
                </svg>
                <span className="text-2xl font-bold tracking-tight">Citea</span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t.footer.product}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white transition">
                  {t.header.features}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-400 hover:text-white transition">
                  {t.header.pricing}
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-gray-400 hover:text-white transition">
                  {t.header.faq}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t.footer.tools}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#tools" className="text-gray-400 hover:text-white transition">
                  {t.footer.sourceFinder}
                </Link>
              </li>
              <li>
                <Link href="#tools" className="text-gray-400 hover:text-white transition">
                  {t.footer.citationChecker}
                </Link>
              </li>
              <li>
                <Link href="#tools" className="text-gray-400 hover:text-white transition">
                  {t.footer.aiAssistant}
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-400 hover:text-white transition">
                  {t.header.testimonials}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t.footer.contact}</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@citea.com" className="text-gray-400 hover:text-white transition">
                  support@citea.com
                </a>
              </li>
              <li>
                <a href="https://github.com/Mercury-nju/Citea" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  GitHub
                </a>
              </li>
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-gray-400 hover:text-white transition text-left"
                >
                  {t.footer.backToTop}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
