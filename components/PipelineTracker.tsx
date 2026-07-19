'use client'

import { useTranslations } from 'next-intl'
import type { AgentStatus, AgentStep } from '@/lib/agents/types'

const ALL_STEPS: AgentStep[] = [
  'input-analysis',
  'color-palette',
  'typography',
  'theme-building',
  'validation',
  'explanation',
]

const stepIcons: Record<AgentStep, string> = {
  'input-analysis': '🔍',
  'color-palette': '🎨',
  typography: '🔤',
  'theme-building': '🏗️',
  validation: '✅',
  explanation: '💬',
}

interface PipelineTrackerProps {
  steps: AgentStatus[]
}

export function PipelineTracker({ steps }: PipelineTrackerProps) {
  const t = useTranslations()

  const getStatus = (step: AgentStep): AgentStatus | undefined => {
    return steps.find(s => s.step === step)
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-7 animate-fade-in-up">
      <h3 className="text-sm font-semibold text-(--text-secondary) mb-4 uppercase tracking-wide">
        {t('pipeline')}
      </h3>
      <ol className="space-y-3" aria-label={t('pipeline')}>
        {ALL_STEPS.map(step => {
          const status = getStatus(step)
          const state = status?.status || 'pending'

          return (
            <li key={step} className="flex items-center gap-3">
              {/* Status icon */}
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {state === 'running' && (
                  <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin-slow" />
                )}
                {state === 'done' && (
                  <span className="text-green-400 text-lg" aria-hidden="true">✓</span>
                )}
                {state === 'error' && (
                  <span className="text-red-400 text-lg" aria-hidden="true">✗</span>
                )}
                {state === 'pending' && (
                  <span className="text-(--text-secondary)/30 text-lg" aria-hidden="true">○</span>
                )}
              </div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm" aria-hidden="true">{stepIcons[step]}</span>
                  <span className={`text-sm font-medium ${
                    state === 'running' ? 'text-brand-300' :
                    state === 'done' ? 'text-(--text-primary)' :
                    state === 'error' ? 'text-red-400' :
                    'text-(--text-secondary)/60'
                  }`}>
                    {t(`step_${step.replace('-', '_')}`)}
                  </span>
                  <span className="sr-only">
                    — {state === 'running' ? 'in progress' : state === 'done' ? 'done' : state === 'error' ? 'error' : 'pending'}
                  </span>
                </div>
                {status?.message && (
                  <p className="text-xs text-(--text-secondary) mt-0.5 truncate">
                    {status.message}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
