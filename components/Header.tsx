'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Citea
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-primary-600 transition">
              Features
            </Link>
            <Link href="#testimonials" className="text-gray-700 hover:text-primary-600 transition">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-primary-600 transition">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-primary-600 transition">
              FAQ
            </Link>
            <Link href="#" className="text-gray-700 hover:text-primary-600 transition">
              Blog
            </Link>
          </nav>

          {/* Language Selector & Sign In */}
          <div className="hidden md:flex items-center space-x-4">
            <select className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1">
              <option>English</option>
              <option>中文</option>
            </select>
            <Link
              href="#"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Start Free
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
              <Link href="#features" className="text-gray-700 hover:text-primary-600 transition">
                Features
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-primary-600 transition">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-primary-600 transition">
                Pricing
              </Link>
              <Link href="#faq" className="text-gray-700 hover:text-primary-600 transition">
                FAQ
              </Link>
              <Link href="#" className="text-gray-700 hover:text-primary-600 transition">
                Blog
              </Link>
              <Link
                href="#"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition text-center"
              >
                Start Free
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

