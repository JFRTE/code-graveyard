'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import zh from '@/i18n/zh.json'
import en from '@/i18n/en.json'

type Lang = 'zh' | 'en'
type Translations = typeof zh

const translations: Record<Lang, Translations> = { zh, en }

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType>({
  lang: 'zh',
  setLang: () => {},
  t: zh,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang
    if (saved && translations[saved]) setLangState(saved)

    const handler = (e: CustomEvent) => {
      const newLang = e.detail as Lang
      if (translations[newLang]) setLangState(newLang)
    }
    window.addEventListener('langChange', handler as EventListener)
    return () => window.removeEventListener('langChange', handler as EventListener)
  }, [])

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
  }, [])

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
