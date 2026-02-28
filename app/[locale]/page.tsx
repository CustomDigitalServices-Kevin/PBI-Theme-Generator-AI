'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSelector } from '@/components/LanguageSelector'
import { InputZone } from '@/components/InputZone'
import { PipelineTracker } from '@/components/PipelineTracker'
import { ColorPreview } from '@/components/ColorPreview'
import { JsonPreview } from '@/components/JsonPreview'
import type { AgentStatus, OrchestratorResult } from '@/lib/agents/types'

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()

  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'text' | 'image'>('text')
  const [imageBase64, setImageBase64] = useState<string | undefined>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [steps, setSteps] = useState<AgentStatus[]>([])
  const [result, setResult] = useState<OrchestratorResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!input && inputType === 'text') return
    if (!imageBase64 && inputType === 'image') return

    setIsGenerating(true)
    setResult(null)
    setError(null)
    setSteps([])

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, inputType, imageBase64, locale }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Request failed')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const data = line.replace(/^data: /, '')
          if (data === '[DONE]') continue
          if (!data) continue

          try {
            const event = JSON.parse(data)
            if (event.type === 'result') {
              setResult(event.data)
            } else if (event.step) {
              setSteps(prev => {
                const existing = prev.findIndex(s => s.step === event.step)
                if (existing >= 0) {
                  const updated = [...prev]
                  updated[existing] = event
                  return updated
                }
                return [...prev, event]
              })
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result.theme, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.theme.name?.replace(/\s+/g, '-').toLowerCase() || 'theme'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(JSON.stringify(result.theme, null, 2))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      setImageBase64(base64)
      setInput(file.name)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-16">
      {/* Language selector */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Title */}
      <div className="text-center mb-10 sm:mb-16 max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            PBI Theme Generator
          </span>
          <span className="text-brand-300 ml-2 text-2xl sm:text-4xl">AI</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base">
          {t('subtitle')}
        </p>
      </div>

      {/* Input zone */}
      <div className="w-full max-w-2xl mb-8">
        <InputZone
          input={input}
          inputType={inputType}
          onInputChange={setInput}
          onTypeChange={setInputType}
          onImageUpload={handleImageUpload}
          imageBase64={imageBase64}
        />

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!input && inputType === 'text') || (!imageBase64 && inputType === 'image')}
          className="w-full mt-4 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 animate-pulse-glow disabled:animate-none"
        >
          {isGenerating ? t('generating') : t('generate')}
        </button>

        {error && (
          <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
        )}
      </div>

      {/* Pipeline tracker */}
      {steps.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <PipelineTracker steps={steps} />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="w-full max-w-2xl space-y-6">
          {/* Explanation */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-3">{t('explanation')}</h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-2">
              {result.explanation.summary}
            </p>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              {result.explanation.accessibilityNotes}
            </p>
          </div>

          {/* Color preview */}
          <ColorPreview palette={result.palette} />

          {/* JSON preview */}
          <JsonPreview theme={result.theme} />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 transition-all"
            >
              {t('download')}
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 py-3 rounded-xl font-semibold text-[var(--text-primary)] glass hover:bg-white/5 transition-all"
            >
              {t('copy')}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="mt-16 text-[var(--text-secondary)] text-xs">
        {t('footer')}
      </p>
    </div>
  )
}
