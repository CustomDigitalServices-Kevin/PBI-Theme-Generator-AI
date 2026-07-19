import { describe, expect, it } from 'vitest'
import { buildColorPalette } from '../palette'
import { contrastRatio, meetsAA } from '../contrast'
import type { BrandAnalysis } from '../../agents/types'

const SAMPLE_BRAND: BrandAnalysis = {
  primaryColor: '#1E3A5F',
  secondaryColor: '#2563EB',
  accentColor: '#D4AF37',
  tone: 'corporate',
  industry: 'fintech',
  mood: 'corporate',
  description: 'A fintech brand',
}

describe('buildColorPalette', () => {
  it('produces exactly 8 data colors', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    expect(palette.dataColors).toHaveLength(8)
  })

  it('produces 8 visually distinct data colors (no duplicates)', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    const unique = new Set(palette.dataColors)
    expect(unique.size).toBe(8)
  })

  it('every data color passes WCAG AA for large graphical objects (3:1) against the background', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    for (const color of palette.dataColors) {
      const ratio = contrastRatio(color, palette.background)
      expect(meetsAA(ratio, true)).toBe(true)
    }
  })

  it('reports contrastRatios matching the actual computed ratio for each data color', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    expect(palette.contrastRatios).toHaveLength(8)
    for (let i = 0; i < palette.dataColors.length; i++) {
      const entry = palette.contrastRatios[i]
      expect(entry.color).toBe(palette.dataColors[i])
      expect(entry.passesAA).toBe(true)
      const actualRatio = contrastRatio(entry.color, palette.background)
      expect(entry.ratio).toBeCloseTo(actualRatio, 1)
    }
  })

  it('foreground text passes WCAG AAA-level contrast (7:1) against the background', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    expect(contrastRatio(palette.foreground, palette.background)).toBeGreaterThanOrEqual(7.0)
  })

  it('hyperlink passes WCAG AA normal-text contrast (4.5:1) against the background', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    expect(contrastRatio(palette.hyperlink, palette.background)).toBeGreaterThanOrEqual(4.5)
  })

  it('headerForeground passes WCAG AA (4.5:1) against headerBackground, not against the page background', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    expect(contrastRatio(palette.headerForeground, palette.headerBackground)).toBeGreaterThanOrEqual(4.5)
  })

  it('tableAccent and selectionColor pass the 3:1 large-object threshold against the background', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    expect(contrastRatio(palette.tableAccent, palette.background)).toBeGreaterThanOrEqual(3.0)
    expect(contrastRatio(palette.selectionColor, palette.background)).toBeGreaterThanOrEqual(3.0)
  })

  it('every returned color is a valid 6-digit hex string', () => {
    const palette = buildColorPalette(SAMPLE_BRAND)
    const hexPattern = /^#[0-9A-F]{6}$/
    const allColors = [
      ...palette.dataColors,
      palette.background,
      palette.foreground,
      palette.tableAccent,
      palette.hyperlink,
      palette.headerBackground,
      palette.headerForeground,
      palette.selectionColor,
    ]
    for (const color of allColors) {
      expect(color).toMatch(hexPattern)
    }
  })

  it('is deterministic: the same brand input always produces the same palette', () => {
    const paletteA = buildColorPalette(SAMPLE_BRAND)
    const paletteB = buildColorPalette(SAMPLE_BRAND)
    expect(paletteA).toEqual(paletteB)
  })

  it('produces different palettes for different brand colors', () => {
    const otherBrand: BrandAnalysis = { ...SAMPLE_BRAND, primaryColor: '#EC4899', secondaryColor: '#7C3AED', accentColor: '#EAB308' }
    const paletteA = buildColorPalette(SAMPLE_BRAND)
    const paletteB = buildColorPalette(otherBrand)
    expect(paletteA.dataColors).not.toEqual(paletteB.dataColors)
  })
})
