/**
 * Central model configuration for the 6-agent pipeline.
 *
 * Every agent imports its model id from here instead of hardcoding it,
 * so a model swap (e.g. for cost, latency, or quality reasons) is a
 * one-line change instead of a multi-file search-and-replace.
 *
 * Haiku handles structured extraction / mechanical steps; Sonnet
 * handles the steps that benefit most from stronger reasoning
 * (color theory, full theme assembly, localized prose).
 */
export const AGENT_MODELS = {
  inputAnalyzer: 'claude-haiku-4-5-20251001',
  colorPalette: 'claude-sonnet-5',
  typography: 'claude-haiku-4-5-20251001',
  themeBuilder: 'claude-sonnet-5',
  validator: 'claude-haiku-4-5-20251001',
  explainer: 'claude-sonnet-5',
} as const satisfies Record<string, string>

export type AgentName = keyof typeof AGENT_MODELS
