import Anthropic from '@anthropic-ai/sdk'
import type { BrandAnalysis, ColorPalette, TypographyConfig, PowerBITheme } from './types'
import { parseJsonResponse } from './utils'

const systemPrompt = `You are a Power BI theme expert. Assemble a complete Power BI Desktop theme JSON from the provided color palette, typography, and brand data.

The theme must follow the official Power BI theme schema exactly. Include:
- name, dataColors, background, foreground, tableAccent
- maximum, center, minimum (for conditional formatting)
- header, headerForeground, hyperlink, selection
- good, neutral, bad (for KPI colors)
- textClasses with callout, title, header, label
- visualStyles for common visual types (page, card, slicer)

Return ONLY valid JSON matching the PowerBITheme structure. No markdown, no explanation.`

export async function runThemeBuilder(
  client: Anthropic,
  brand: BrandAnalysis,
  palette: ColorPalette,
  typography: TypographyConfig
): Promise<PowerBITheme> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Build a Power BI theme JSON with these inputs:

Brand: ${brand.tone} / ${brand.industry} / ${brand.mood}
Name suggestion: "${brand.description}"

Colors:
- dataColors: ${JSON.stringify(palette.dataColors)}
- background: ${palette.background}
- foreground: ${palette.foreground}
- tableAccent: ${palette.tableAccent}
- hyperlink: ${palette.hyperlink}
- headerBackground: ${palette.headerBackground}
- headerForeground: ${palette.headerForeground}
- selectionColor: ${palette.selectionColor}

Typography:
- fontFamily: ${typography.fontFamily}
- fontSize: ${typography.fontSize}
- headerFontFamily: ${typography.headerFontFamily}
- headerFontSize: ${typography.headerFontSize}
- titleFontSize: ${typography.titleFontSize}
- labelFontSize: ${typography.labelFontSize}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJsonResponse<PowerBITheme>(text)
}
