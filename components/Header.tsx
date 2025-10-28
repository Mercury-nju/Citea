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
            <div className="relative">
              <select 
                className="appearance-none text-sm text-gray-600 bg-transparent border-none cursor-pointer pr-6 py-2 focus:outline-none flex items-center gap-1"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
              <Globe size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <Link
              href="#tools"
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
              <select 
                className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 cursor-pointer"
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

