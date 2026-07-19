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
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
      >
        <h2 className="text-lg font-semibold">{t('json_preview')}</h2>
        <span className="text-(--text-secondary) text-xl">
          {isExpanded ? '▾' : '▸'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          <pre className="bg-black/30 rounded-xl p-4 overflow-x-auto text-xs font-mono text-(--text-secondary) max-h-[400px] overflow-y-auto">
            {json}
          </pre>
        </div>
      )}
    </div>
  )
}
