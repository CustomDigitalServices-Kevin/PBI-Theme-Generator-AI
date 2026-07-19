import { describe, expect, it } from 'vitest'
import { extractDominantColors } from '../imageColors'

function makePixelBuffer(pixels: Array<[number, number, number, number]>): Uint8ClampedArray {
  const buf = new Uint8ClampedArray(pixels.length * 4)
  pixels.forEach(([r, g, b, a], i) => {
    buf[i * 4] = r
    buf[i * 4 + 1] = g
    buf[i * 4 + 2] = b
    buf[i * 4 + 3] = a
  })
  return buf
}

describe('extractDominantColors', () => {
  it('returns the single color of a uniform image', () => {
    const pixels = makePixelBuffer(Array(10).fill([200, 30, 30, 255]))
    const colors = extractDominantColors(pixels, 3)
    expect(colors).toHaveLength(1)
    expect(colors[0]).toBe('#C81E1E')
  })

  it('orders results by pixel frequency, most common first', () => {
    const pixels = makePixelBuffer([
      ...Array(20).fill([30, 30, 200, 255]), // dominant blue
      ...Array(5).fill([30, 200, 30, 255]), // minority green
    ])
    const colors = extractDominantColors(pixels, 2)
    expect(colors[0]).toBe('#1E1EC8')
    expect(colors[1]).toBe('#1EC81E')
  })

  it('excludes fully transparent pixels', () => {
    const pixels = makePixelBuffer([
      ...Array(10).fill([255, 0, 0, 0]), // transparent, should be ignored
      ...Array(5).fill([0, 255, 0, 255]),
    ])
    const colors = extractDominantColors(pixels, 3)
    expect(colors).toEqual(['#00FF00'])
  })

  it('excludes near-white pixels (typical logo background)', () => {
    const pixels = makePixelBuffer([
      ...Array(50).fill([250, 250, 250, 255]), // near-white background, majority of pixels
      ...Array(10).fill([108, 99, 255, 255]), // the actual brand color, minority
    ])
    const colors = extractDominantColors(pixels, 3)
    expect(colors).toEqual(['#6C63FF'])
  })

  it('respects the colorCount limit', () => {
    const pixels = makePixelBuffer([
      ...Array(10).fill([200, 0, 0, 255]),
      ...Array(9).fill([0, 200, 0, 255]),
      ...Array(8).fill([0, 0, 200, 255]),
      ...Array(7).fill([200, 200, 0, 255]),
    ])
    const colors = extractDominantColors(pixels, 2)
    expect(colors).toHaveLength(2)
  })

  it('returns an empty array when every pixel is transparent or near-white', () => {
    const pixels = makePixelBuffer([
      ...Array(5).fill([255, 255, 255, 255]),
      ...Array(5).fill([100, 100, 100, 0]),
    ])
    expect(extractDominantColors(pixels, 3)).toEqual([])
  })

  it('is deterministic for the same input', () => {
    const pixels = makePixelBuffer([
      ...Array(15).fill([50, 120, 200, 255]),
      ...Array(8).fill([200, 50, 120, 255]),
    ])
    expect(extractDominantColors(pixels, 2)).toEqual(extractDominantColors(pixels, 2))
  })
})
