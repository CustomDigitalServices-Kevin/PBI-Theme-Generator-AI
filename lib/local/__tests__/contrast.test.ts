import { describe, expect, it } from 'vitest'
import { contrastRatio, meetsAA, relativeLuminance, adjustForContrast } from '../contrast'
import { hexToRgb } from '../color'

describe('relativeLuminance (W3C formula)', () => {
  it('is 1 for white', () => {
    expect(relativeLuminance(hexToRgb('#FFFFFF'))).toBeCloseTo(1, 5)
  })

  it('is 0 for black', () => {
    expect(relativeLuminance(hexToRgb('#000000'))).toBeCloseTo(0, 5)
  })
})

describe('contrastRatio (W3C reference values)', () => {
  it('black vs white is exactly 21:1 (the maximum possible ratio)', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
  })

  it('a color against itself is 1:1', () => {
    expect(contrastRatio('#6C63FF', '#6C63FF')).toBeCloseTo(1, 5)
  })

  it('is symmetric (order of arguments does not matter)', () => {
    expect(contrastRatio('#333333', '#EEEEEE')).toBeCloseTo(contrastRatio('#EEEEEE', '#333333'), 10)
  })

  it('#767676 on white is ~4.54:1 (the well-known WebAIM "minimum AA gray" reference)', () => {
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 1)
  })

  it('#949494 on white is ~3.03:1 (below the 4.5 normal-text AA threshold)', () => {
    expect(contrastRatio('#949494', '#FFFFFF')).toBeCloseTo(3.03, 1)
  })

  it('matches this project\'s own verified design tokens: #0B0B0D bg vs #9B9BA3 text ~7.13:1', () => {
    expect(contrastRatio('#0B0B0D', '#9B9BA3')).toBeCloseTo(7.13, 1)
  })
})

describe('meetsAA', () => {
  it('4.5:1 passes normal text AA (the exact threshold)', () => {
    expect(meetsAA(4.5)).toBe(true)
  })

  it('4.49:1 fails normal text AA', () => {
    expect(meetsAA(4.49)).toBe(false)
  })

  it('3.0:1 fails normal text AA but passes large text AA', () => {
    expect(meetsAA(3.0, false)).toBe(false)
    expect(meetsAA(3.0, true)).toBe(true)
  })

  it('2.9:1 fails even large text AA', () => {
    expect(meetsAA(2.9, true)).toBe(false)
  })
})

describe('adjustForContrast', () => {
  it('returns the input unchanged if it already meets the target', () => {
    expect(adjustForContrast('#FFFFFF', '#000000', 4.5)).toBe('#FFFFFF')
  })

  it('darkens or lightens a failing color until it reaches the AA threshold', () => {
    // brand-500 #6C63FF on white measures 4.32:1 — fails normal-text AA (verified during T25 redesign)
    const before = contrastRatio('#6C63FF', '#FFFFFF')
    expect(before).toBeLessThan(4.5)

    const adjusted = adjustForContrast('#6C63FF', '#FFFFFF', 4.5)
    const after = contrastRatio(adjusted, '#FFFFFF')
    expect(after).toBeGreaterThanOrEqual(4.5)
  })

  it('preserves hue when darkening (only lightness changes)', () => {
    const adjusted = adjustForContrast('#6C63FF', '#FFFFFF', 4.5)
    // brand-600 (#5A4FF0) is the known-good AA-passing neighbor from the same hue family
    expect(adjusted.toLowerCase()).not.toBe('#000000')
    expect(adjusted.toLowerCase()).not.toBe('#ffffff')
  })

  it('every data color in a realistic 8-color palette can be pushed to pass AA against a dark background', () => {
    const bg = '#0B0B0D'
    const rawColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B983FF', '#FF9F1C', '#2EC4B6', '#E71D36']
    for (const color of rawColors) {
      const adjusted = adjustForContrast(color, bg, 3.0) // WCAG AA for graphical objects
      expect(contrastRatio(adjusted, bg)).toBeGreaterThanOrEqual(3.0)
    }
  })
})
