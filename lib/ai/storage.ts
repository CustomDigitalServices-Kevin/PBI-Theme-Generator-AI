/**
 * Session-only storage for BYOK credentials. sessionStorage is
 * deliberately used instead of localStorage or a cookie: the key is
 * cleared the moment the browser tab closes, never persists across
 * sessions, and is never sent to any CDS server (it stays entirely on
 * the client and is only ever attached to requests made directly from
 * the browser to api.mistral.ai / api.anthropic.com).
 */
import type { AICredentials, AIProviderId } from './types'

const STORAGE_KEY = 'pbi-theme-generator:ai-credentials'

export function loadCredentials(): AICredentials | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AICredentials
    if (!parsed.provider || !parsed.apiKey) return null
    return parsed
  } catch {
    return null
  }
}

export function saveCredentials(provider: AIProviderId, apiKey: string): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, apiKey }))
}

export function clearCredentials(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(STORAGE_KEY)
}
