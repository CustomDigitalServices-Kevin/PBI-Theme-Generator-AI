/**
 * WCAG 2.x contrast checking, implemented from the official W3C relative
 * luminance formula: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 * and the contrast ratio formula from WCAG 2.1 SC 1.4.3:
 * https://www.w3.org/TR/WCAG21/#contrast-minimum
 */
import { clamp, hexToHsl, hexToRgb, hslToHex, type RGB } from './color'

const AA_NORMAL_TEXT = 4.5
const AA_LARGE_TEXT = 3.0

function srgbChannelToLinear(channel8bit: number): number {
  const c = channel8bit / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** W3C relative luminance of an sRGB color, in the 0 (black) - 1 (white) range. */
export function relativeLuminance(rgb: RGB): number {
  const r = srgbChannelToLinear(rgb.r)
  const g = srgbChannelToLinear(rgb.g)
  const b = srgbChannelToLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two colors, always >= 1 (identical) and <= 21 (black/white). */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexToRgb(hexA))
  const lumB = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsAA(ratio: number, isLargeText = false): boolean {
  return ratio >= (isLargeText ? AA_LARGE_TEXT : AA_NORMAL_TEXT)
}

/**
 * Adjusts `foregroundHex`'s HSL lightness (hue and saturation untouched, so
 * the color stays recognizably "the same color") until its contrast against
 * `backgroundHex` reaches `targetRatio`. Walks lightness in both directions
 * (toward black and toward white) and returns whichever direction reaches
 * the target first, preferring the smaller lightness delta.
 *
 * Returns the original color unchanged if it already meets the target.
 */
export function adjustForContrast(
  foregroundHex: string,
  backgroundHex: string,
  targetRatio: number = AA_NORMAL_TEXT
): string {
  if (contrastRatio(foregroundHex, backgroundHex) >= targetRatio) {
    return foregroundHex.toUpperCase()
  }

  const hsl = hexToHsl(foregroundHex)
  const step = 1 // 1% lightness steps for fine-grained convergence

  let darkened = { ...hsl }
  let lightened = { ...hsl }
  let darkSteps = 0
  let lightSteps = 0

  while (darkened.l > 0) {
    darkened = { ...darkened, l: clamp(darkened.l - step, 0, 100) }
    darkSteps++
    if (contrastRatio(hslToHex(darkened), backgroundHex) >= targetRatio) break
    if (darkened.l <= 0) break
  }
  const darkResult = hslToHex(darkened)
  const darkOk = contrastRatio(darkResult, backgroundHex) >= targetRatio

  while (lightened.l < 100) {
    lightened = { ...lightened, l: clamp(lightened.l + step, 0, 100) }
    lightSteps++
    if (contrastRatio(hslToHex(lightened), backgroundHex) >= targetRatio) break
    if (lightened.l >= 100) break
  }
  const lightResult = hslToHex(lightened)
  const lightOk = contrastRatio(lightResult, backgroundHex) >= targetRatio

  if (darkOk && lightOk) return darkSteps <= lightSteps ? darkResult : lightResult
  if (darkOk) return darkResult
  if (lightOk) return lightResult

  // Neither direction reached the target (can happen for a mid-gray
  // background where even pure black/white is the best available) —
  // return whichever extreme has the higher contrast.
  const darkFinalRatio = contrastRatio(darkResult, backgroundHex)
  const lightFinalRatio = contrastRatio(lightResult, backgroundHex)
  return darkFinalRatio >= lightFinalRatio ? darkResult : lightResult
}
