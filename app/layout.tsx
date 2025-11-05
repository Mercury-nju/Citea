import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Citea - Free AI Citation Checker & Source Finder | Verify Academic References',
  description: 'Free AI-powered citation verification tool. Check fake citations, find academic sources from CrossRef, PubMed, arXiv & Semantic Scholar. No limits, no registration required.',
  keywords: 'citation checker, source finder, academic research, AI citation verification, fake citation detector, reference verification, academic integrity, research tool, CrossRef, PubMed, free citation tool',
  authors: [{ name: 'Citea Team' }],
  creator: 'Citea',
  publisher: 'Citea',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://citea.vercel.app',
    title: 'Citea - Free AI Citation Checker & Source Finder',
    description: 'Verify academic citations and find credible sources instantly. 100% free, unlimited usage, no registration.',
    siteName: 'Citea',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citea - Free AI Citation Checker',
    description: 'Verify citations, find sources, maintain academic integrity. Completely free.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

