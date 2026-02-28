import Anthropic from '@anthropic-ai/sdk'
import type { AgentStatus, GenerateRequest, OrchestratorResult } from './types'
import { runInputAnalyzer } from './inputAnalyzer'
import { runColorPaletteAgent } from './colorPalette'
import { runTypographyAgent } from './typography'
import { runThemeBuilder } from './themeBuilder'
import { runValidator } from './validator'
import { runExplainer } from './explainer'

export async function* orchestrate(
  request: GenerateRequest
): AsyncGenerator<AgentStatus | { type: 'result'; data: OrchestratorResult }> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Step 1: Input Analysis
  yield { step: 'input-analysis', status: 'running' }
  let brand
  try {
    brand = await runInputAnalyzer(client, request.input, request.inputType, request.imageBase64)
    yield { step: 'input-analysis', status: 'done', message: `${brand.tone} / ${brand.industry}` }
  } catch (e) {
    yield { step: 'input-analysis', status: 'error', message: String(e) }
    throw e
  }

  // Step 2: Color Palette
  yield { step: 'color-palette', status: 'running' }
  let palette
  try {
    palette = await runColorPaletteAgent(client, brand)
    yield { step: 'color-palette', status: 'done', message: `${palette.dataColors.length} colors` }
  } catch (e) {
    yield { step: 'color-palette', status: 'error', message: String(e) }
    throw e
  }

  // Step 3: Typography
  yield { step: 'typography', status: 'running' }
  let typography
  try {
    typography = await runTypographyAgent(client, brand)
    yield { step: 'typography', status: 'done', message: typography.fontFamily }
  } catch (e) {
    yield { step: 'typography', status: 'error', message: String(e) }
    throw e
  }

  // Step 4: Theme Building
  yield { step: 'theme-building', status: 'running' }
  let theme
  try {
    theme = await runThemeBuilder(client, brand, palette, typography)
    yield { step: 'theme-building', status: 'done', message: theme.name }
  } catch (e) {
    yield { step: 'theme-building', status: 'error', message: String(e) }
    throw e
  }

  // Step 5: Validation
  yield { step: 'validation', status: 'running' }
  try {
    const validation = await runValidator(client, theme)
    if (validation.fixedTheme) theme = validation.fixedTheme
    yield {
      step: 'validation',
      status: 'done',
      message: validation.isValid ? 'Valid' : `Fixed ${validation.errors.length} issue(s)`,
    }
  } catch (e) {
    yield { step: 'validation', status: 'error', message: String(e) }
    throw e
  }

  // Step 6: Explanation
  yield { step: 'explanation', status: 'running' }
  let explanation
  try {
    explanation = await runExplainer(client, brand, palette, typography, request.locale)
    yield { step: 'explanation', status: 'done' }
  } catch (e) {
    yield { step: 'explanation', status: 'error', message: String(e) }
    throw e
  }

  yield { type: 'result', data: { theme, palette, explanation } }
}
