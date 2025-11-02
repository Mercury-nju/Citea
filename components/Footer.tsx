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
                <a 
                  href="https://discord.gg/GQZDMRYhGC" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span>{t.footer.discord || 'Discord 社群'}</span>
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
