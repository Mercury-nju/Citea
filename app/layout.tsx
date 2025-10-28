import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Citea - Find Sources in Seconds. Cite Only What\'s Real.',
  description: 'AI citation checker and source finder tool. Check fake citations, verify references, and find original sources — completely free.',
  keywords: 'citation checker, source finder, academic research, AI citation verification, fake citation detector',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

