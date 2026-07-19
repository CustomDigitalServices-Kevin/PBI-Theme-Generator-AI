'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { AIProviderId } from '@/lib/ai/types'

export type GenerationMode = 'local' | 'ai'

interface ModeSelectorProps {
  mode: GenerationMode
  provider: AIProviderId
  apiKey: string
  onApply: (mode: GenerationMode, provider: AIProviderId, apiKey: string) => void
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]'

export function ModeSelector({ mode, provider, apiKey, onApply }: ModeSelectorProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [draftMode, setDraftMode] = useState<GenerationMode>(mode)
  const [draftProvider, setDraftProvider] = useState<AIProviderId>(provider)
  const [draftKey, setDraftKey] = useState(apiKey)
  const ref = useRef<HTMLDivElement>(null)

  const openPanel = () => {
    setDraftMode(mode)
    setDraftProvider(provider)
    setDraftKey(apiKey)
    setIsOpen(true)
  }

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

  const canApplyAI = draftMode === 'local' || draftKey.trim().length > 0

  const handleApply = () => {
    if (!canApplyAI) return
    onApply(draftMode, draftProvider, draftKey.trim())
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => (isOpen ? setIsOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`glass rounded-full pl-3 pr-2.5 py-2 text-sm flex items-center gap-2 hover:bg-white/[0.05] transition-colors ${FOCUS_RING}`}
      >
        <span aria-hidden="true">{mode === 'local' ? '🔒' : '✨'}</span>
        <span className="text-xs font-medium tracking-wide">
          {mode === 'local' ? t('mode_local') : t('mode_ai_short', { provider: provider === 'mistral' ? 'Mistral' : 'Anthropic' })}
        </span>
        <span
          className={`text-(--text-secondary) text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div role="dialog" aria-label={t('mode_panel_title')} className="absolute right-0 mt-2 glass rounded-2xl p-4 w-80 z-50">
          <h3 className="text-sm font-semibold mb-3">{t('mode_panel_title')}</h3>

          <div className="space-y-2 mb-3">
            <button
              onClick={() => setDraftMode('local')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${FOCUS_RING} ${
                draftMode === 'local' ? 'bg-brand-600 text-white' : 'bg-black/20 text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <span className="font-medium">🔒 {t('mode_local')}</span>
              <p className="text-xs mt-0.5 opacity-80">{t('mode_local_desc')}</p>
            </button>
            <button
              onClick={() => setDraftMode('ai')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${FOCUS_RING} ${
                draftMode === 'ai' ? 'bg-brand-600 text-white' : 'bg-black/20 text-(--text-secondary) hover:text-(--text-primary)'
              }`}
            >
              <span className="font-medium">✨ {t('mode_ai')}</span>
              <p className="text-xs mt-0.5 opacity-80">{t('mode_ai_desc')}</p>
            </button>
          </div>

          {draftMode === 'ai' && (
            <div className="space-y-3 pt-3 border-t border-(--border)">
              <div>
                <label htmlFor="ai-provider" className="text-xs text-(--text-secondary) block mb-1">
                  {t('mode_provider_label')}
                </label>
                <select
                  id="ai-provider"
                  value={draftProvider}
                  onChange={(e) => setDraftProvider(e.target.value as AIProviderId)}
                  className={`w-full bg-black/20 border border-(--border) rounded-xl px-3 py-2 text-sm text-(--text-primary) ${FOCUS_RING}`}
                >
                  <option value="mistral">Mistral (mistral-small-2603)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                </select>
              </div>

              <div>
                <label htmlFor="ai-key" className="text-xs text-(--text-secondary) block mb-1">
                  {t('mode_api_key_label')}
                </label>
                <input
                  id="ai-key"
                  type="password"
                  autoComplete="off"
                  value={draftKey}
                  onChange={(e) => setDraftKey(e.target.value)}
                  placeholder={draftProvider === 'mistral' ? 'sk-...' : 'sk-ant-...'}
                  className={`w-full bg-black/20 border border-(--border) rounded-xl px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-secondary)/50 ${FOCUS_RING}`}
                />
              </div>

              <p className="text-[11px] text-(--text-secondary) leading-relaxed">{t('mode_key_tradeoff')}</p>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={!canApplyAI}
            className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-brand-600 to-brand-800 hover:from-brand-500 hover:to-brand-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`}
          >
            {t('mode_apply')}
          </button>
        </div>
      )}
    </div>
  )
}
