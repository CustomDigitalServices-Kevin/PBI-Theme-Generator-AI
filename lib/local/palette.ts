/**
 * Deterministic HSL-based color palette generation for the Local mode.
 * Given a brand's primary/secondary/accent colors, derives a complete
 * Power BI ColorPalette (8 data colors + semantic slots) using pure HSL
 * math, then verifies and auto-corrects every color against
 * lib/local/contrast.ts so the output always passes WCAG AA — this is
 * proven by tests, not eyeballed.
 */
import type { BrandAnalysis, ColorPalette } from '../agents/types'
import { hexToHsl, hslToHex, clamp } from './color'
import { adjustForContrast, contrastRatio, meetsAA } from './contrast'

const BACKGROUND = '#FFFFFF'
const DATA_COLOR_TARGET_RATIO = 3.0 // WCAG AA for large-scale graphical objects (chart series)
const TEXT_TARGET_RATIO = 4.5 // WCAG AA for normal text
const HEADER_BG_TARGET_RATIO = 4.5

function hueStep(baseHue: number, offset: number): number {
  return ((baseHue + offset) % 360 + 360) % 360
}

/** Builds 8 visually distinct data colors by hue-stepping around the brand's three source colors. */
function buildDataColors(primary: string, secondary: string, accent: string): string[] {
  const p = hexToHsl(primary)
  const s = hexToHsl(secondary)
  const a = hexToHsl(accent)

  const specs: { h: number; s: number; l: number }[] = [
    { h: p.h, s: clamp(p.s, 55, 80), l: clamp(p.l, 40, 60) },
    { h: s.h, s: clamp(s.s, 55, 80), l: clamp(s.l, 40, 60) },
    { h: a.h, s: clamp(a.s, 55, 80), l: clamp(a.l, 40, 60) },
    { h: hueStep(p.h, 40), s: 65, l: 52 },
    { h: hueStep(p.h, -40), s: 60, l: 48 },
    { h: hueStep(s.h, 60), s: 62, l: 55 },
    { h: hueStep(a.h, -60), s: 58, l: 45 },
    { h: hueStep(p.h, 150), s: 55, l: 50 },
  ]

  const seen = new Set<string>()
  const colors: string[] = []
  for (const spec of specs) {
    let hex = hslToHex(spec)
    hex = adjustForContrast(hex, BACKGROUND, DATA_COLOR_TARGET_RATIO)
    // Nudge the hue slightly if this exact color was already produced, so all 8 stay distinguishable
    let attempts = 0
    while (seen.has(hex) && attempts < 10) {
      const nudged = { ...spec, h: hueStep(spec.h, 15 * (attempts + 1)) }
      hex = adjustForContrast(hslToHex(nudged), BACKGROUND, DATA_COLOR_TARGET_RATIO)
      attempts++
    }
    seen.add(hex)
    colors.push(hex)
  }
  return colors
}

export function buildColorPalette(brand: BrandAnalysis): ColorPalette {
  const dataColors = buildDataColors(brand.primaryColor, brand.secondaryColor, brand.accentColor)

  const primaryHsl = hexToHsl(brand.primaryColor)
  const foregroundRaw = hslToHex({ h: primaryHsl.h, s: clamp(primaryHsl.s * 0.15, 0, 15), l: 15 })
  const foreground = adjustForContrast(foregroundRaw, BACKGROUND, 7.0) // AAA-level body text contrast

  const tableAccent = adjustForContrast(brand.primaryColor, BACKGROUND, DATA_COLOR_TARGET_RATIO)

  const hyperlinkCandidate =
    contrastRatio(brand.accentColor, BACKGROUND) >= contrastRatio(brand.secondaryColor, BACKGROUND)
      ? brand.accentColor
      : brand.secondaryColor
  const hyperlink = adjustForContrast(hyperlinkCandidate, BACKGROUND, TEXT_TARGET_RATIO)

  const headerBackground = hslToHex({ h: primaryHsl.h, s: clamp(primaryHsl.s * 0.3, 0, 20), l: 96 })
  const headerForeground = adjustForContrast(foreground, headerBackground, HEADER_BG_TARGET_RATIO)

  const selectionColor = adjustForContrast(brand.accentColor, BACKGROUND, DATA_COLOR_TARGET_RATIO)

  const contrastRatios = dataColors.map((color) => {
    const ratio = contrastRatio(color, BACKGROUND)
    return { color, ratio: Math.round(ratio * 100) / 100, passesAA: meetsAA(ratio, true) }
  })

  return {
    dataColors,
    background: BACKGROUND,
    foreground,
    tableAccent,
    hyperlink,
    headerBackground,
    headerForeground,
    selectionColor,
    contrastRatios,
  }
}
