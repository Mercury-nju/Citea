'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Citea</h3>
            <p className="text-gray-400">
              Your research integrity guardian. Citea traces citations back to their original sources 
              and detects AI-generated fake literature, helping researchers maintain credibility in the age of artificial intelligence.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-400 hover:text-white transition">
                  Pricing (Free!)
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-gray-400 hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#tools" className="text-gray-400 hover:text-white transition">
                  Source Finder
                </Link>
              </li>
              <li>
                <Link href="#tools" className="text-gray-400 hover:text-white transition">
                  Citation Checker
                </Link>
              </li>
              <li>
                <Link href="#tools" className="text-gray-400 hover:text-white transition">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-400 hover:text-white transition">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
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
                  Back to Top ↑
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>Copyright © 2025 Citea. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

