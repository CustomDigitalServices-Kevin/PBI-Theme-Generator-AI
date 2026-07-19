import { describe, expect, it } from 'vitest'
import { matchTextToBrand } from '../textMatch'

describe('matchTextToBrand', () => {
  it('extracts explicitly named colors in order (primary, secondary, accent)', () => {
    const { analysis } = matchTextToBrand('Modern fintech startup with dark blue and gold accents')
    expect(analysis.primaryColor).toBe('#1E3A5F') // "dark blue" wins over "blue" alone
    expect(analysis.secondaryColor).toBe('#D4AF37') // gold
  })

  it('prefers multi-word color names over their single-word substring', () => {
    const { analysis } = matchTextToBrand('A dark blue and navy brand')
    expect(analysis.primaryColor).toBe('#1E3A5F')
  })

  it('matches an industry keyword and applies its preset colors when no color is named', () => {
    const { analysis } = matchTextToBrand('A healthcare clinic focused on patient trust')
    expect(analysis.industry).toBe('healthcare')
    expect(analysis.primaryColor).toBe('#0D9488')
  })

  it('matches a tone keyword', () => {
    const { analysis } = matchTextToBrand('A playful and fun brand for kids')
    expect(analysis.tone).toBe('playful')
  })

  it('defaults tone to corporate when an industry matched but no explicit tone keyword did', () => {
    const { analysis } = matchTextToBrand('A legal firm')
    expect(analysis.tone).toBe('corporate')
  })

  it('defaults tone to minimal when nothing matched at all', () => {
    const { analysis } = matchTextToBrand('xyz qwerty blah')
    expect(analysis.tone).toBe('minimal')
  })

  it('flags low confidence when no color, industry, or tone keyword matched', () => {
    const { isLowConfidence } = matchTextToBrand('asdkjfh qwoeiru')
    expect(isLowConfidence).toBe(true)
  })

  it('does not flag low confidence when at least a named color matched', () => {
    const { isLowConfidence } = matchTextToBrand('I like red')
    expect(isLowConfidence).toBe(false)
  })

  it('always returns a value from the fixed BrandAnalysis.tone enum', () => {
    const validTones = ['corporate', 'playful', 'minimal', 'bold', 'elegant']
    const inputs = ['tech startup', 'random gibberish zzz', 'elegant luxury brand', 'bold and strong']
    for (const input of inputs) {
      const { analysis } = matchTextToBrand(input)
      expect(validTones).toContain(analysis.tone)
    }
  })

  it('falls back to the generic preset when nothing matches', () => {
    const { analysis } = matchTextToBrand('lorem ipsum dolor sit amet')
    expect(analysis.primaryColor).toBe('#4F46E5')
    expect(analysis.industry).toBe('general')
  })

  it('truncates an overly long description to 140 characters', () => {
    const longInput = 'a'.repeat(300)
    const { analysis } = matchTextToBrand(longInput)
    expect(analysis.description.length).toBeLessThanOrEqual(140)
  })
})
