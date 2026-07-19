'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { PowerBITheme } from '@/lib/agents/types'

interface JsonPreviewProps {
  theme: PowerBITheme
}

export function JsonPreview({ theme }: JsonPreviewProps) {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)

  const json = JSON.stringify(theme, null, 2)

  return (
    <div className="glass rounded-3xl overflow-hidden animate-fade-in-up">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-6 sm:px-7 py-4.5 hover:bg-white/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
      >
        <h2 className="text-lg font-semibold tracking-tight">{t('json_preview')}</h2>
        <span
          className={`text-(--text-secondary) transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 sm:px-7 pb-6 sm:pb-7">
          <pre className="bg-black/40 border border-(--border) rounded-2xl p-4 overflow-x-auto text-xs font-mono text-(--text-secondary) max-h-[400px] overflow-y-auto">
            {json}
          </pre>
        </div>
      )}
    </div>
  )
}
