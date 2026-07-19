/**
 * Curated, static typography presets for the Local (no-AI) mode.
 * Font choices are restricted to fonts pre-installed on Windows, matching
 * the same constraint enforced in lib/agents/typography.ts and
 * lib/agents/validator.ts's system prompts: a custom/web font would
 * silently fall back on another user's machine since Power BI theme
 * files don't embed fonts.
 */
import type { BrandAnalysis, TypographyConfig } from '../agents/types'

const PRESETS: Record<BrandAnalysis['tone'], TypographyConfig> = {
  corporate: {
    fontFamily: 'Segoe UI',
    fontSize: 12,
    headerFontFamily: 'Segoe UI Semibold',
    headerFontSize: 16,
    titleFontSize: 20,
    labelFontSize: 10,
  },
  minimal: {
    fontFamily: 'Segoe UI',
    fontSize: 11,
    headerFontFamily: 'Segoe UI',
    headerFontSize: 15,
    titleFontSize: 18,
    labelFontSize: 9,
  },
  playful: {
    fontFamily: 'Trebuchet MS',
    fontSize: 12,
    headerFontFamily: 'Trebuchet MS',
    headerFontSize: 17,
    titleFontSize: 22,
    labelFontSize: 10,
  },
  bold: {
    fontFamily: 'Tahoma',
    fontSize: 12,
    headerFontFamily: 'Segoe UI Semibold',
    headerFontSize: 18,
    titleFontSize: 24,
    labelFontSize: 10,
  },
  elegant: {
    fontFamily: 'Cambria',
    fontSize: 12,
    headerFontFamily: 'Georgia',
    headerFontSize: 16,
    titleFontSize: 20,
    labelFontSize: 10,
  },
}

export function pickTypographyPreset(tone: BrandAnalysis['tone']): TypographyConfig {
  return { ...PRESETS[tone] }
}
