/**
 * Assembles a complete Power BI theme JSON from a BrandAnalysis + palette +
 * typography via plain templating — no LLM involved. Produces the exact
 * same PowerBITheme shape as lib/agents/themeBuilder.ts (the AI pipeline),
 * following the same visualStyles cascade documented in that agent's
 * system prompt: a wildcard entry for container chrome, plus textbox/image
 * suppression and card/slicer overrides.
 */
import type { BrandAnalysis, ColorPalette, TypographyConfig, PowerBITheme } from '../agents/types'
import { hexToHsl, hslToHex } from './color'
import { adjustForContrast } from './contrast'

const GOOD = '#16A34A'
const NEUTRAL = '#D97706'
const BAD = '#DC2626'

function titleCase(word: string): string {
  return word.length === 0 ? word : word[0].toUpperCase() + word.slice(1)
}

export function buildLocalTheme(
  brand: BrandAnalysis,
  palette: ColorPalette,
  typography: TypographyConfig
): PowerBITheme {
  const primaryHsl = hexToHsl(brand.primaryColor)
  const maximum = adjustForContrast(palette.tableAccent, palette.background, 3.0)
  const minimum = hslToHex({ h: primaryHsl.h, s: 15, l: 92 })
  const center = hslToHex({ h: primaryHsl.h, s: 30, l: 70 })

  const name = `${titleCase(brand.industry)} ${titleCase(brand.tone)} (Local)`.slice(0, 60)

  return {
    name,
    dataColors: palette.dataColors,
    background: palette.background,
    foreground: palette.foreground,
    tableAccent: palette.tableAccent,
    maximum,
    center,
    minimum,
    header: palette.headerBackground,
    headerForeground: palette.headerForeground,
    hyperlink: palette.hyperlink,
    selection: palette.selectionColor,
    good: GOOD,
    neutral: NEUTRAL,
    bad: BAD,
    textClasses: {
      callout: { fontSize: typography.titleFontSize, fontFace: typography.headerFontFamily, color: palette.foreground },
      title: { fontSize: typography.titleFontSize, fontFace: typography.headerFontFamily, color: palette.foreground },
      header: { fontSize: typography.headerFontSize, fontFace: typography.headerFontFamily, color: palette.foreground },
      label: { fontSize: typography.labelFontSize, fontFace: typography.fontFamily, color: palette.foreground },
    },
    visualStyles: {
      '*': {
        '*': {
          title: [{ show: true, fontSize: typography.headerFontSize, fontColor: { solid: { color: palette.foreground } } }],
          border: [{ show: false }],
          dropShadow: [{ show: false }],
          background: [{ color: { solid: { color: palette.background } }, transparency: 0 }],
          padding: [{ top: 8, bottom: 8, left: 8, right: 8 }],
        },
      },
      textbox: {
        '*': {
          title: [{ show: false }],
          border: [{ show: false }],
          background: [{ show: false }],
          dropShadow: [{ show: false }],
        },
      },
      image: {
        '*': {
          title: [{ show: false }],
          border: [{ show: false }],
          background: [{ show: false }],
          dropShadow: [{ show: false }],
        },
      },
      card: {
        '*': {
          callout: [{ fontSize: typography.titleFontSize, fontColor: { solid: { color: palette.tableAccent } } }],
          categoryLabel: [{ fontSize: typography.labelFontSize, color: { solid: { color: palette.foreground } } }],
        },
      },
      slicer: {
        '*': {
          header: [{ fontSize: typography.headerFontSize, fontColor: { solid: { color: palette.foreground } } }],
          items: [{ fontColor: { solid: { color: palette.foreground } }, background: { solid: { color: palette.tableAccent } } }],
        },
      },
    },
  }
}
