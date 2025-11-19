'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, getTranslation } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: ReturnType<typeof getTranslation>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [t, setT] = useState(() => getTranslation('en'))

  useEffect(() => {
    // 从 localStorage 读取语言偏好
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && ['en','zh','es','fr','de','ja'].includes(savedLang)) {
      setLanguageState(savedLang)
      setT(getTranslation(savedLang))
    } else {
      // 检测浏览器语言并匹配支持的语言
      const browserLang = navigator.language.toLowerCase()
      let detectedLang: Language = 'en'
      if (browserLang.startsWith('zh')) detectedLang = 'zh'
      else if (browserLang.startsWith('es')) detectedLang = 'es'
      else if (browserLang.startsWith('fr')) detectedLang = 'fr'
      else if (browserLang.startsWith('de')) detectedLang = 'de'
      else if (browserLang.startsWith('ja')) detectedLang = 'ja'
      setLanguageState(detectedLang)
      setT(getTranslation(detectedLang))
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setT(getTranslation(lang))
    localStorage.setItem('language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

