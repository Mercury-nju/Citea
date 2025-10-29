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
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Compact glass-morphism navbar */}
        <nav className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-full shadow-lg shadow-gray-200/50 px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link 
                href="#features" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                {t.header.features}
              </Link>
              <Link 
                href="#testimonials" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                {t.header.testimonials}
              </Link>
              <Link 
                href="#faq" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                {t.header.faq}
              </Link>
            </div>

            {/* Right Side - Language & CTA */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative">
                <select 
                  className="appearance-none text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-full cursor-pointer pl-3 pr-8 py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
                >
                  <option value="en">EN</option>
                  <option value="zh">中文</option>
                </select>
                <Globe size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              {/* CTA Button */}
              <Link
                href="/auth/signin"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm font-medium"
              >
                {t.header.startFree}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <nav className="flex flex-col gap-2">
                <Link 
                  href="#features" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.features}
                </Link>
                <Link 
                  href="#testimonials" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.testimonials}
                </Link>
                <Link 
                  href="#faq" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.header.faq}
                </Link>
                
                <div className="flex items-center gap-2 mt-2">
                  <select 
                    className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-3 py-2"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value as 'en' | 'zh')
                      setIsMenuOpen(false)
                    }}
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                  
                  <Link
                    href="/auth/signin"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-center text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.header.startFree}
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
