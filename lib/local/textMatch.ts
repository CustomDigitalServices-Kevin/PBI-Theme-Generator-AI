/**
 * Deterministic keyword/preset matching for the "Local" text-input mode.
 * This is intentionally NOT natural language understanding — it's a
 * lookup-table match against named colors, industry keywords, and mood
 * keywords. Free-form descriptions that don't hit these keywords fall
 * back to a generic preset; the UI is expected to honestly disclose that
 * free text is better served by the optional AI mode.
 */
import type { BrandAnalysis } from '../agents/types'

const NAMED_COLORS: Record<string, string> = {
  blue: '#2563EB', 'dark blue': '#1E3A5F', navy: '#1E3A5F', teal: '#0D9488',
  turquoise: '#14B8A6', cyan: '#06B6D4', sapphire: '#2563A6',
  red: '#DC2626', crimson: '#B91C1C', burgundy: '#7F1D1D', coral: '#F97066',
  green: '#16A34A', emerald: '#059669', mint: '#34D399', lime: '#84CC16',
  yellow: '#EAB308', gold: '#D4AF37', amber: '#D97706',
  orange: '#EA580C', bronze: '#92400E',
  purple: '#7C3AED', violet: '#8B5CF6', lavender: '#A78BFA', indigo: '#4F46E5', magenta: '#C026D3',
  pink: '#EC4899', rose: '#F43F5E',
  black: '#111111', charcoal: '#1F2937', gray: '#6B7280', grey: '#6B7280', silver: '#9CA3AF',
  white: '#F5F5F5', cream: '#FAF3E0', beige: '#E7DDC8',
  brown: '#78350F',
}

const INDUSTRY_KEYWORDS: Record<string, { keywords: string[]; primary: string; secondary: string; accent: string }> = {
  fintech: { keywords: ['fintech', 'finance', 'banking', 'bank', 'investment', 'trading'], primary: '#1E3A5F', secondary: '#2563EB', accent: '#D4AF37' },
  healthcare: { keywords: ['health', 'healthcare', 'medical', 'clinic', 'hospital', 'pharma'], primary: '#0D9488', secondary: '#2563EB', accent: '#F97066' },
  tech: { keywords: ['tech', 'technology', 'software', 'saas', 'startup', 'app', 'ai', 'data'], primary: '#4F46E5', secondary: '#6C63FF', accent: '#14B8A6' },
  retail: { keywords: ['retail', 'ecommerce', 'shop', 'store', 'fashion'], primary: '#EC4899', secondary: '#7C3AED', accent: '#EAB308' },
  education: { keywords: ['education', 'school', 'university', 'learning', 'academy'], primary: '#2563EB', secondary: '#F97066', accent: '#EAB308' },
  legal: { keywords: ['legal', 'law', 'attorney', 'lawyer', 'firm'], primary: '#1F2937', secondary: '#7F1D1D', accent: '#D4AF37' },
  realestate: { keywords: ['realestate', 'realty', 'property', 'housing'], primary: '#78350F', secondary: '#16A34A', accent: '#D4AF37' },
  food: { keywords: ['food', 'restaurant', 'cafe', 'catering', 'culinary'], primary: '#DC2626', secondary: '#EA580C', accent: '#16A34A' },
  travel: { keywords: ['travel', 'tourism', 'hotel', 'airline', 'hospitality'], primary: '#06B6D4', secondary: '#EA580C', accent: '#EAB308' },
  energy: { keywords: ['energy', 'solar', 'renewable', 'utility', 'power'], primary: '#16A34A', secondary: '#EAB308', accent: '#1E3A5F' },
  media: { keywords: ['media', 'entertainment', 'gaming', 'game', 'studio', 'film'], primary: '#7C3AED', secondary: '#EC4899', accent: '#EAB308' },
  nonprofit: { keywords: ['nonprofit', 'charity', 'ngo', 'foundation'], primary: '#0D9488', secondary: '#2563EB', accent: '#F97066' },
}

const TONE_KEYWORDS: Record<BrandAnalysis['tone'], string[]> = {
  corporate: ['corporate', 'professional', 'formal', 'serious', 'traditional', 'business'],
  playful: ['playful', 'fun', 'energetic', 'vibrant', 'youthful', 'friendly', 'colorful'],
  minimal: ['minimal', 'minimalist', 'clean', 'simple', 'modern', 'sleek'],
  bold: ['bold', 'strong', 'dynamic', 'confident', 'powerful', 'striking'],
  elegant: ['elegant', 'luxury', 'luxurious', 'sophisticated', 'premium', 'refined', 'classy'],
}

/** Splits text into lowercase alphabetic tokens. No backslash-escaped regex sequences here on purpose. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 0)
}

/**
 * Matches named colors against a token stream, preferring two-word phrases
 * ("dark blue") over their single-word component ("blue") when both would
 * otherwise match at the same position, and returning colors in the order
 * they appear in the input.
 */
function findNamedColors(tokens: string[]): string[] {
  const hexes: string[] = []
  let i = 0
  while (i < tokens.length && hexes.length < 3) {
    const twoWord = i + 1 < tokens.length ? `${tokens[i]} ${tokens[i + 1]}` : null
    if (twoWord && NAMED_COLORS[twoWord]) {
      if (!hexes.includes(NAMED_COLORS[twoWord])) hexes.push(NAMED_COLORS[twoWord])
      i += 2
      continue
    }
    const oneWord = tokens[i]
    if (NAMED_COLORS[oneWord] && !hexes.includes(NAMED_COLORS[oneWord])) {
      hexes.push(NAMED_COLORS[oneWord])
    }
    i += 1
  }
  return hexes
}

function findIndustry(lowerInput: string): { key: string; primary: string; secondary: string; accent: string } | null {
  for (const [key, entry] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (entry.keywords.some((kw) => lowerInput.includes(kw))) {
      return { key, ...entry }
    }
  }
  return null
}

function findTone(lowerInput: string): BrandAnalysis['tone'] | null {
  for (const [tone, keywords] of Object.entries(TONE_KEYWORDS) as [BrandAnalysis['tone'], string[]][]) {
    if (keywords.some((kw) => lowerInput.includes(kw))) return tone
  }
  return null
}

export interface TextMatchResult {
  analysis: BrandAnalysis
  /** True when neither a named color, an industry, nor a tone keyword matched — the UI should suggest AI mode for this input. */
  isLowConfidence: boolean
}

const DEFAULT_PRESET = { primary: '#4F46E5', secondary: '#6C63FF', accent: '#14B8A6' }

export function matchTextToBrand(input: string): TextMatchResult {
  const lower = input.toLowerCase()
  const tokens = tokenize(lower)

  const namedColors = findNamedColors(tokens)
  const industry = findIndustry(lower)
  const matchedTone = findTone(lower)
  const tone = matchedTone ?? (industry ? 'corporate' : 'minimal')

  const primary = namedColors[0] ?? industry?.primary ?? DEFAULT_PRESET.primary
  const secondary = namedColors[1] ?? industry?.secondary ?? DEFAULT_PRESET.secondary
  const accent = namedColors[2] ?? industry?.accent ?? DEFAULT_PRESET.accent

  const isLowConfidence = namedColors.length === 0 && industry === null && matchedTone === null

  const analysis: BrandAnalysis = {
    primaryColor: primary,
    secondaryColor: secondary,
    accentColor: accent,
    tone,
    industry: industry?.key ?? 'general',
    mood: tone,
    description: input.trim().slice(0, 140) || 'A theme generated from keyword matching.',
  }

  return { analysis, isLowConfidence }
}
