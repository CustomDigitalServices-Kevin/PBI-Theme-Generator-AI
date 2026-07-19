import type { AIExecutor } from '../ai/types'
import type { BrandAnalysis, ColorPalette } from './types'
import { parseJsonResponse } from './utils'
import { colorPaletteSchema } from './schemas'

const systemPrompt = `You are an expert color designer specializing in data visualization and accessibility. Given brand attributes, generate a complete color palette for a Power BI theme.

Requirements:
- Generate exactly 8 data colors that work well together for charts (distinguishable from each other, not just tints of one hue — vary hue as well as lightness so colorblind users can still tell series apart)
- background/foreground must reach at least 7:1 contrast (WCAG AAA for body text); headerBackground/headerForeground must reach at least 4.5:1 (WCAG AA)
- Each of the 8 dataColors must reach at least 3:1 contrast against background (WCAG AA for graphical objects / large-scale chart elements). If a color that fits the brand's hue family would fail this, adjust its lightness until it passes — do not abandon the brand hue.
- Colors should reflect the brand's tone and industry: corporate/elegant brands should lean toward more restrained saturation, playful/bold brands can use more saturated, energetic colors
- Include background, foreground, tableAccent, hyperlink, headerBackground, headerForeground, selectionColor
- hyperlink must be visually distinct from both foreground and tableAccent so links are recognizable
- Compute the actual WCAG contrast ratio (relative luminance formula) for each data color against background — do not estimate or round generously

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

export async function runColorPaletteAgent(executor: AIExecutor, brand: BrandAnalysis): Promise<ColorPalette> {
  const text = await executor.complete({
    system: systemPrompt,
    userText: `Generate an accessible 8-color palette for this brand:\n\nPrimary: ${brand.primaryColor}\nSecondary: ${brand.secondaryColor}\nAccent: ${brand.accentColor}\nTone: ${brand.tone}\nIndustry: ${brand.industry}\nMood: ${brand.mood}`,
    maxTokens: 1200,
    schema: colorPaletteSchema,
    schemaName: 'color_palette',
  })

  return parseJsonResponse<ColorPalette>(text)
}
