'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const languages = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'hi', flag: '🇮🇳', label: 'हिन्दी' },
]

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]'

export function LanguageSelector() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = languages.find(l => l.code === locale) || languages[1]

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const switchLocale = (code: string) => {
    const segments = pathname.split('/')
    segments[1] = code
    router.push(segments.join('/'))
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`glass rounded-full pl-3 pr-2.5 py-2 text-sm flex items-center gap-2 hover:bg-white/[0.05] transition-colors ${FOCUS_RING}`}
      >
        <span aria-hidden="true">{current.flag}</span>
        <span className="uppercase text-xs font-medium tracking-wide">{current.code}</span>
        <span
          className={`text-(--text-secondary) text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 glass rounded-2xl overflow-hidden z-50 min-w-[170px] py-1"
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === locale}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.05] ${FOCUS_RING} ${
                lang.code === locale ? 'text-brand-300 bg-white/[0.03]' : 'text-(--text-secondary)'
              }`}
            >
              <span aria-hidden="true">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
