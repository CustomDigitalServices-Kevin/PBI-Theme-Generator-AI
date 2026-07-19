/**
 * Dominant color extraction from raw image pixel data via histogram
 * quantization (deterministic, no ML, no network). The pure algorithm
 * (extractDominantColors) is unit-testable with a synthetic pixel buffer;
 * getImageDataFromBase64 is the browser-only Canvas wrapper that feeds it
 * real pixel data and is not unit-tested (documented boundary — Canvas
 * is unavailable outside a real browser).
 */
import { rgbToHex, hexToHsl, type RGB } from './color'
import type { BrandAnalysis } from '../agents/types'

const NEAR_WHITE_THRESHOLD = 245
const CHANNEL_BUCKETS = 4 // 4 levels per channel = 64 total buckets

function bucketIndex(value: number): number {
  return Math.min(CHANNEL_BUCKETS - 1, Math.floor((value / 256) * CHANNEL_BUCKETS))
}

/**
 * Extracts up to `colorCount` dominant colors from an RGBA pixel buffer
 * (as produced by CanvasRenderingContext2D.getImageData().data) via
 * histogram bucketing. Transparent and near-white pixels are excluded so
 * a logo's white/transparent background doesn't dominate the result.
 */
export function extractDominantColors(pixels: Uint8ClampedArray, colorCount: number): string[] {
  const buckets = new Map<number, { r: number; g: number; b: number; count: number }>()

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const alpha = pixels[i + 3]

    if (alpha < 16) continue // fully/mostly transparent
    if (r > NEAR_WHITE_THRESHOLD && g > NEAR_WHITE_THRESHOLD && b > NEAR_WHITE_THRESHOLD) continue // near-white background

    const key = (bucketIndex(r) << 4) | (bucketIndex(g) << 2) | bucketIndex(b)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.r += r
      bucket.g += g
      bucket.b += b
      bucket.count += 1
    } else {
      buckets.set(key, { r, g, b, count: 1 })
    }
  }

  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count)

  if (sorted.length === 0) return []

  return sorted.slice(0, colorCount).map((bucket) => {
    const avg: RGB = {
      r: bucket.r / bucket.count,
      g: bucket.g / bucket.count,
      b: bucket.b / bucket.count,
    }
    return rgbToHex(avg)
  })
}

/**
 * Browser-only: decodes a base64 PNG/JPEG into pixel data via an offscreen
 * canvas. Not unit-tested — Canvas 2D is unavailable in the vitest/jsdom
 * environment used for this project's test suite; this thin wrapper is
 * exercised by manual smoke testing in a real browser instead.
 */
export async function getImageDataFromBase64(base64: string, maxDimension = 200): Promise<Uint8ClampedArray> {
  const image = new Image()
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Failed to decode image'))
  })
  image.src = `data:image/png;base64,${base64}`
  await loaded

  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  ctx.drawImage(image, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height).data
}

/**
 * Derives a BrandAnalysis-shaped object from dominant image colors alone.
 * Industry cannot be inferred from color, so it's always 'general'; tone
 * is inferred from the primary color's own saturation/lightness/hue.
 */
export function deriveBrandFromImageColors(dominantColors: string[]): BrandAnalysis {
  const primaryColor = dominantColors[0] ?? '#4F46E5'
  const secondaryColor = dominantColors[1] ?? primaryColor
  const accentColor = dominantColors[2] ?? secondaryColor

  const hsl = hexToHsl(primaryColor)
  let tone: BrandAnalysis['tone']
  if (hsl.s < 20) {
    tone = hsl.l < 40 ? 'corporate' : 'minimal'
  } else if (hsl.h >= 25 && hsl.h <= 55 && hsl.s < 70 && hsl.l < 55) {
    tone = 'elegant' // warm gold/brown range at moderate saturation
  } else if (hsl.s >= 60 && hsl.l >= 45 && hsl.l <= 75) {
    tone = 'bold'
  } else if (hsl.s >= 60 && hsl.l > 60) {
    tone = 'playful'
  } else {
    tone = 'corporate'
  }

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    tone,
    industry: 'general',
    mood: tone,
    description: 'A theme derived from the dominant colors found in the uploaded image.',
  }
}
