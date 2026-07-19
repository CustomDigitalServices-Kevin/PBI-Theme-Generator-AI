/**
 * Central model configuration for the 6-agent pipeline, across both BYOK
 * providers.
 *
 * Mistral (default provider) uses a single model — mistral-small-2603
 * (Mistral Small 4: hybrid instruct/reasoning/coding, vision, native
 * structured-output json_schema support) — for every step, per the
 * advisor-approved plan.
 *
 * Anthropic (alternative provider) keeps the tiering from the original
 * server-side pipeline: Haiku for mechanical steps, Sonnet for steps
 * that benefit most from stronger reasoning.
 */
export const MISTRAL_MODEL = 'mistral-small-2603'

export const ANTHROPIC_AGENT_MODELS = {
  inputAnalyzer: 'claude-haiku-4-5-20251001',
  colorPalette: 'claude-sonnet-5',
  typography: 'claude-haiku-4-5-20251001',
  themeBuilder: 'claude-sonnet-5',
  validator: 'claude-haiku-4-5-20251001',
  explainer: 'claude-sonnet-5',
} as const satisfies Record<string, string>

export type AgentName = keyof typeof ANTHROPIC_AGENT_MODELS

export function modelForAgent(provider: 'mistral' | 'anthropic', agent: AgentName): string {
  return provider === 'mistral' ? MISTRAL_MODEL : ANTHROPIC_AGENT_MODELS[agent]
}
