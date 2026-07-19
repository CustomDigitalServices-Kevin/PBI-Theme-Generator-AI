import { describe, expect, it } from 'vitest'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, hexToHsl, hslToHex, clamp } from '../color'

describe('clamp', () => {
  it('clamps below the minimum', () => {
    expect(clamp(-5, 0, 100)).toBe(0)
  })
  it('clamps above the maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })
  it('passes through in-range values', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })
})

describe('hexToRgb / rgbToHex round trip', () => {
  it('handles 6-digit hex', () => {
    expect(hexToRgb('#6C63FF')).toEqual({ r: 108, g: 99, b: 255 })
  })

  it('handles 3-digit shorthand hex', () => {
    expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('round-trips a full-precision color', () => {
    expect(rgbToHex(hexToRgb('#2E86AB'))).toBe('#2E86AB')
  })

  it('round-trips black and white', () => {
    expect(rgbToHex(hexToRgb('#000000'))).toBe('#000000')
    expect(rgbToHex(hexToRgb('#FFFFFF'))).toBe('#FFFFFF')
  })
})

describe('rgbToHsl / hslToRgb round trip', () => {
  it('pure red is hue 0, full saturation, 50% lightness', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 })
    expect(hsl.h).toBeCloseTo(0, 0)
    expect(hsl.s).toBeCloseTo(100, 0)
    expect(hsl.l).toBeCloseTo(50, 0)
  })

  it('pure green is hue 120', () => {
    const hsl = rgbToHsl({ r: 0, g: 255, b: 0 })
    expect(hsl.h).toBeCloseTo(120, 0)
  })

  it('pure blue is hue 240', () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 255 })
    expect(hsl.h).toBeCloseTo(240, 0)
  })

  it('gray has zero saturation', () => {
    const hsl = rgbToHsl({ r: 128, g: 128, b: 128 })
    expect(hsl.s).toBeCloseTo(0, 0)
  })

  it('round-trips RGB -> HSL -> RGB within 1 unit of rounding error', () => {
    const original = { r: 108, g: 99, b: 255 }
    const roundTripped = hslToRgb(rgbToHsl(original))
    expect(Math.abs(roundTripped.r - original.r)).toBeLessThanOrEqual(1)
    expect(Math.abs(roundTripped.g - original.g)).toBeLessThanOrEqual(1)
    expect(Math.abs(roundTripped.b - original.b)).toBeLessThanOrEqual(1)
  })
})

describe('hexToHsl / hslToHex convenience wrappers', () => {
  it('round-trips a hex color through HSL', () => {
    const hex = '#6C63FF'
    const roundTripped = hslToHex(hexToHsl(hex))
    // Allow for small rounding drift introduced by the HSL conversion
    const rgb1 = hexToRgb(hex)
    const rgb2 = hexToRgb(roundTripped)
    expect(Math.abs(rgb1.r - rgb2.r)).toBeLessThanOrEqual(2)
    expect(Math.abs(rgb1.g - rgb2.g)).toBeLessThanOrEqual(2)
    expect(Math.abs(rgb1.b - rgb2.b)).toBeLessThanOrEqual(2)
  })
})
