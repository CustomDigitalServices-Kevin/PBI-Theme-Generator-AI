import type { AIExecutor } from '../ai/types'
import type { BrandAnalysis, ColorPalette, TypographyConfig, PowerBITheme } from './types'
import { parseJsonResponse } from './utils'

const systemPrompt = `You are a Power BI theme expert. Assemble a complete Power BI Desktop theme JSON from the provided color palette, typography, and brand data, following the official Power BI Report Theme JSON schema.

Required top-level fields:
- name, dataColors, background, foreground, tableAccent
- maximum, center, minimum (gradient extremes for conditional formatting / color scales)
- header, headerForeground, hyperlink, selection
- good, neutral, bad (flat hex colors for KPI / conditional formatting semantics — use a green-leaning, amber/gray-leaning, and red-leaning hue respectively, adapted to stay legible against background)
- textClasses with callout, title, header, label — each an object with fontSize, fontFace, color

visualStyles must follow Power BI's formatting cascade and include at minimum a wildcard entry:
- visualStyles["*"]["*"] sets container chrome defaults applied to every visual: title (show, fontSize, fontColor from textClasses.header), border (show: false), dropShadow (show: false), background (transparent or theme background), padding.
- visualStyles["textbox"]["*"] and visualStyles["image"]["*"] should suppress title, border and background, since those visual types render their own content edge-to-edge.
- visualStyles["card"]["*"] should style the callout number using textClasses.callout and the category label using textClasses.label.
- visualStyles["slicer"]["*"] should apply header text from textClasses.header and use tableAccent for the selected-item accent.

Return ONLY valid JSON matching the PowerBITheme structure. No markdown, no explanation, no trailing commentary.`

export async function runThemeBuilder(
  executor: AIExecutor,
  brand: BrandAnalysis,
  palette: ColorPalette,
  typography: TypographyConfig
): Promise<PowerBITheme> {
  const text = await executor.complete({
    system: systemPrompt,
    userText: `Build a Power BI theme JSON with these inputs:

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
    maxTokens: 3500,
    schemaName: 'power_bi_theme',
    // No `schema`: PowerBITheme.visualStyles is an open-ended cascade that
    // doesn't fit a strict closed schema — see lib/agents/schemas.ts.
  })

  return parseJsonResponse<PowerBITheme>(text)
}
