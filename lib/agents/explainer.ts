import type { AIExecutor } from '../ai/types'
import type { BrandAnalysis, ColorPalette, TypographyConfig, ThemeExplanation } from './types'
import { parseJsonResponse } from './utils'
import { themeExplanationSchema } from './schemas'

const langMap: Record<string, string> = {
  fr: 'French', en: 'English', es: 'Spanish', it: 'Italian',
  pt: 'Portuguese', de: 'German', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi',
}

function buildSystemPrompt(language: string): string {
  return `You explain Power BI theme design choices in a clear, concise way for a business user, not a designer. Write entirely in ${language} — every field in the response, with no English words mixed in except hex color codes and font names, which stay as-is since they are not translatable. Return ONLY valid JSON, no markdown fences.`
}

export async function runExplainer(
  executor: AIExecutor,
  brand: BrandAnalysis,
  palette: ColorPalette,
  typography: TypographyConfig,
  locale: string
): Promise<ThemeExplanation> {
  const language = langMap[locale] || 'English'

  const text = await executor.complete({
    system: buildSystemPrompt(language),
    userText: `Explain the design choices for this Power BI theme in ${language}:

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
    maxTokens: 800,
    schema: themeExplanationSchema,
    schemaName: 'theme_explanation',
  })

  return parseJsonResponse<ThemeExplanation>(text)
}
