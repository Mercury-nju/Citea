'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Logo from './Logo'
import { ChevronDown, Globe } from 'lucide-react'
import type { Language } from '@/lib/i18n'

// Language Dropdown Component
function LanguageDropdown({ language, setLanguage }: { language: Language; setLanguage: (lang: Language) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
  ]

  const currentLang = languages.find(l => l.code === language) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm font-medium text-gray-700"
      >
        <Globe size={16} />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                language === lang.code ? 'bg-amber-50 text-amber-700' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-amber-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="group">
            <div className="transition-transform group-hover:scale-105">
              <Logo />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="#features" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            >
              {t.header.features}
            </Link>
            <Link 
              href="#pricing" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            >
              {t.header.pricing}
            </Link>
            <Link 
              href="#faq" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            >
              {t.header.faq}
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Switcher - Dropdown */}
            <LanguageDropdown language={language} setLanguage={setLanguage} />

            {/* CTA Button */}
            <Link 
              href="/auth/signin"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md"
            >
              {t.header.getStarted}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
