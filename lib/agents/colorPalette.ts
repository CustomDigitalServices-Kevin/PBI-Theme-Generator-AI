import Anthropic from '@anthropic-ai/sdk'
import type { BrandAnalysis, ColorPalette } from './types'
import { parseJsonResponse } from './utils'

const systemPrompt = `You are an expert color designer specializing in data visualization and accessibility. Given brand attributes, generate a complete color palette for a Power BI theme.

Requirements:
- Generate exactly 8 data colors that work well together for charts
- All color pairs must pass WCAG AA contrast requirements (4.5:1 for normal text)
- Colors should reflect the brand's tone and industry
- Include background, foreground, tableAccent, hyperlink, headerBackground, headerForeground, selectionColor
- Provide contrast ratio checks for each data color against the background

Return ONLY valid JSON with this exact structure:
{
  "dataColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5", "#hex6", "#hex7", "#hex8"],
  "background": "#hex",
  "foreground": "#hex",
  "tableAccent": "#hex",
  "hyperlink": "#hex",
  "headerBackground": "#hex",
  "headerForeground": "#hex",
  "selectionColor": "#hex",
  "contrastRatios": [{"color": "#hex", "ratio": 4.5, "passesAA": true}, ...]
}`

export async function runColorPaletteAgent(
  client: Anthropic,
  brand: BrandAnalysis
): Promise<ColorPalette> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Generate an accessible 8-color palette for this brand:\n\nPrimary: ${brand.primaryColor}\nSecondary: ${brand.secondaryColor}\nAccent: ${brand.accentColor}\nTone: ${brand.tone}\nIndustry: ${brand.industry}\nMood: ${brand.mood}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJsonResponse<ColorPalette>(text)
}
