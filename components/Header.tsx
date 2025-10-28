'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Logo from './Logo'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-primary-600 transition">
              {t.header.features}
            </Link>
            <Link href="#testimonials" className="text-gray-700 hover:text-primary-600 transition">
              {t.header.testimonials}
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-primary-600 transition">
              {t.header.pricing}
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-primary-600 transition">
              {t.header.faq}
            </Link>
            <Link href="#tools" className="text-gray-700 hover:text-primary-600 transition">
              {t.header.getStarted}
            </Link>
          </nav>

          {/* Language Selector & Sign In */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative inline-flex items-center gap-2 group">
              <Globe size={18} className="text-gray-500" />
              <select 
                className="appearance-none text-sm text-gray-700 bg-white border border-gray-200 rounded-lg cursor-pointer pl-3 pr-8 py-2 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
            >
              {t.header.startFree}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link href="#features" className="text-gray-700 hover:text-primary-600 transition" onClick={() => setIsMenuOpen(false)}>
                {t.header.features}
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-primary-600 transition" onClick={() => setIsMenuOpen(false)}>
                {t.header.testimonials}
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-primary-600 transition" onClick={() => setIsMenuOpen(false)}>
                {t.header.pricing}
              </Link>
              <Link href="#faq" className="text-gray-700 hover:text-primary-600 transition" onClick={() => setIsMenuOpen(false)}>
                {t.header.faq}
              </Link>
              <Link 
                href="#tools" 
                className="text-gray-700 hover:text-primary-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.getStarted}
              </Link>
              
              {/* Mobile Language Selector */}
              <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                <Globe size={18} className="text-gray-500" />
                <select 
                  className="flex-1 text-sm text-gray-700 bg-transparent border-none cursor-pointer focus:outline-none"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as 'en' | 'zh')
                    setIsMenuOpen(false)
                  }}
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="zh">🇨🇳 中文</option>
                </select>
              </div>
              
              <Link
                href="#tools"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.startFree}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

