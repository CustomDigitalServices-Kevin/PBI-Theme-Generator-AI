/**
 * Local (no-AI) generation pipeline. Deterministic, zero network calls.
 * Mirrors the AgentStatus / OrchestratorResult contract of the AI
 * pipeline (lib/agents/orchestrator.ts) so PipelineTracker and the result
 * views in page.tsx work unchanged regardless of which mode produced the
 * theme. Small pacing delays between steps are purely cosmetic (the
 * underlying computation is already complete and instant) so the
 * pipeline UI reads the same way in both modes.
 */
import type { AgentStatus, GenerateRequest, OrchestratorResult, BrandAnalysis } from '../agents/types'
import { matchTextToBrand } from './textMatch'
import { extractDominantColors, getImageDataFromBase64, deriveBrandFromImageColors } from './imageColors'
import { buildColorPalette } from './palette'
import { pickTypographyPreset } from './typography'
import { buildLocalTheme } from './themeBuilder'

export type LocalTranslator = (key: string, params?: Record<string, string | number>) => string

function pace(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toneLabel(t: LocalTranslator, tone: BrandAnalysis['tone']): string {
  return t(`tone_${tone}`)
}

export async function* generateLocalTheme(
  request: GenerateRequest,
  t: LocalTranslator
): AsyncGenerator<AgentStatus | { type: 'result'; data: OrchestratorResult }> {
  yield { step: 'input-analysis', status: 'running' }
  let brand: BrandAnalysis
  let source: 'image' | 'text_keywords' | 'text_default'
  try {
    if (request.inputType === 'image' && request.imageBase64) {
      const pixels = await getImageDataFromBase64(request.imageBase64)
      const dominant = extractDominantColors(pixels, 3)
      brand = deriveBrandFromImageColors(dominant)
      source = 'image'
    } else {
      const { analysis, isLowConfidence } = matchTextToBrand(request.input)
      brand = analysis
      source = isLowConfidence ? 'text_default' : 'text_keywords'
    }
    await pace()
    yield { step: 'input-analysis', status: 'done', message: `${brand.tone} / ${brand.industry}` }
  } catch (e) {
    yield { step: 'input-analysis', status: 'error', message: String(e) }
    throw e
  }

  yield { step: 'color-palette', status: 'running' }
  const palette = buildColorPalette(brand)
  await pace()
  yield { step: 'color-palette', status: 'done', message: `${palette.dataColors.length} colors` }

  yield { step: 'typography', status: 'running' }
  const typography = pickTypographyPreset(brand.tone)
  await pace()
  yield { step: 'typography', status: 'done', message: typography.fontFamily }

  yield { step: 'theme-building', status: 'running' }
  const theme = buildLocalTheme(brand, palette, typography)
  await pace()
  yield { step: 'theme-building', status: 'done', message: theme.name }

  yield { step: 'validation', status: 'running' }
  const requiredKeys: (keyof typeof theme)[] = [
    'name', 'dataColors', 'background', 'foreground', 'tableAccent',
    'maximum', 'center', 'minimum', 'header', 'headerForeground',
    'hyperlink', 'selection', 'good', 'neutral', 'bad', 'textClasses', 'visualStyles',
  ]
  const missing = requiredKeys.filter((key) => theme[key] === undefined || theme[key] === null)
  await pace()
  yield {
    step: 'validation',
    status: 'done',
    message: missing.length === 0 ? 'Valid' : `Missing ${missing.length} field(s)`,
  }

  yield { step: 'explanation', status: 'running' }
  const passCount = palette.contrastRatios.filter((c) => c.passesAA).length
  const explanation = {
    summary: t('local_explanation_summary', { tone: toneLabel(t, brand.tone), source: t(`source_${source}`) }),
    colorChoices: t('local_explanation_colors', { count: palette.dataColors.length, source: t(`source_${source}`) }),
    typographyChoices: t('local_explanation_typography', {
      fontFamily: typography.fontFamily,
      headerFontFamily: typography.headerFontFamily,
    }),
    accessibilityNotes: t('local_explanation_accessibility', {
      passCount,
      count: palette.contrastRatios.length,
    }),
  }
  await pace()
  yield { step: 'explanation', status: 'done' }

  yield { type: 'result', data: { theme, palette, explanation } }
}
