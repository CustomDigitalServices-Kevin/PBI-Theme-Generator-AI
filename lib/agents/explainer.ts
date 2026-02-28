import Anthropic from '@anthropic-ai/sdk'
import type { BrandAnalysis, ColorPalette, TypographyConfig, ThemeExplanation } from './types'
import { parseJsonResponse } from './utils'

export async function runExplainer(
  client: Anthropic,
  brand: BrandAnalysis,
  palette: ColorPalette,
  typography: TypographyConfig,
  locale: string
): Promise<ThemeExplanation> {
  const langMap: Record<string, string> = {
    fr: 'French', en: 'English', es: 'Spanish', it: 'Italian',
    pt: 'Portuguese', de: 'German', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi',
  }
  const language = langMap[locale] || 'English'

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: `You explain design choices in a clear, concise way. Write in ${language}. Return ONLY valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `Explain the design choices for this Power BI theme in ${language}:

Brand: ${brand.tone} / ${brand.industry} / ${brand.mood}
Data colors: ${JSON.stringify(palette.dataColors)}
Background: ${palette.background}, Foreground: ${palette.foreground}
Fonts: ${typography.fontFamily} (body), ${typography.headerFontFamily} (headers)
Accessibility: ${palette.contrastRatios.filter(c => c.passesAA).length}/${palette.contrastRatios.length} colors pass WCAG AA

Return JSON:
{
  "summary": "2-3 sentence overall summary",
  "colorChoices": "Why these colors were chosen",
  "typographyChoices": "Why these fonts and sizes",
  "accessibilityNotes": "Accessibility compliance notes"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJsonResponse<ThemeExplanation>(text)
}
