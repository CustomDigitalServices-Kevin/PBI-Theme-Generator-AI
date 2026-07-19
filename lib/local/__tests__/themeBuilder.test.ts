import { describe, expect, it } from 'vitest'
import { buildLocalTheme } from '../themeBuilder'
import { buildColorPalette } from '../palette'
import { pickTypographyPreset } from '../typography'
import type { BrandAnalysis } from '../../agents/types'

const BRAND: BrandAnalysis = {
  primaryColor: '#1E3A5F',
  secondaryColor: '#2563EB',
  accentColor: '#D4AF37',
  tone: 'corporate',
  industry: 'fintech',
  mood: 'corporate',
  description: 'A fintech brand',
}

function build() {
  const palette = buildColorPalette(BRAND)
  const typography = pickTypographyPreset(BRAND.tone)
  return buildLocalTheme(BRAND, palette, typography)
}

const REQUIRED_TOP_LEVEL_KEYS = [
  'name', 'dataColors', 'background', 'foreground', 'tableAccent',
  'maximum', 'center', 'minimum', 'header', 'headerForeground',
  'hyperlink', 'selection', 'good', 'neutral', 'bad', 'textClasses', 'visualStyles',
] as const

describe('buildLocalTheme — key completeness', () => {
  it('includes every required top-level PowerBITheme key', () => {
    const theme = build()
    for (const key of REQUIRED_TOP_LEVEL_KEYS) {
      expect(theme).toHaveProperty(key)
      expect((theme as unknown as Record<string, unknown>)[key]).not.toBeUndefined()
    }
  })

  it('dataColors has exactly 8 entries', () => {
    expect(build().dataColors).toHaveLength(8)
  })

  it('textClasses has all 4 required sub-objects, each with fontSize/fontFace/color', () => {
    const { textClasses } = build()
    for (const key of ['callout', 'title', 'header', 'label'] as const) {
      expect(textClasses[key]).toHaveProperty('fontSize')
      expect(textClasses[key]).toHaveProperty('fontFace')
      expect(textClasses[key]).toHaveProperty('color')
      expect(typeof textClasses[key].fontSize).toBe('number')
      expect(textClasses[key].fontSize).toBeGreaterThan(0)
    }
  })

  it('visualStyles has a wildcard entry', () => {
    const { visualStyles } = build()
    const wildcard = visualStyles as Record<string, Record<string, unknown>>
    expect(wildcard['*']).toBeDefined()
    expect(wildcard['*']['*']).toBeDefined()
  })

  it('visualStyles suppresses title/border/background for textbox and image', () => {
    const { visualStyles } = build()
    const styles = visualStyles as Record<string, Record<string, Array<{ show?: boolean }>[]>>
    for (const type of ['textbox', 'image']) {
      const entry = styles[type]['*'] as unknown as Record<string, Array<{ show?: boolean }>>
      expect(entry.title[0].show).toBe(false)
      expect(entry.border[0].show).toBe(false)
    }
  })

  it('good/neutral/bad are valid hex colors', () => {
    const theme = build()
    const hexPattern = /^#[0-9A-Fa-f]{6}$/
    expect(theme.good).toMatch(hexPattern)
    expect(theme.neutral).toMatch(hexPattern)
    expect(theme.bad).toMatch(hexPattern)
  })

  it('name is a non-empty string under 60 characters (Power BI theme name practical limit)', () => {
    const { name } = build()
    expect(name.length).toBeGreaterThan(0)
    expect(name.length).toBeLessThanOrEqual(60)
  })

  it('is deterministic for the same inputs', () => {
    const themeA = build()
    const themeB = build()
    expect(themeA).toEqual(themeB)
  })

  it('serializes to valid JSON with no undefined/circular values', () => {
    const theme = build()
    expect(() => JSON.stringify(theme)).not.toThrow()
    const roundTripped = JSON.parse(JSON.stringify(theme))
    expect(roundTripped.name).toBe(theme.name)
  })
})
