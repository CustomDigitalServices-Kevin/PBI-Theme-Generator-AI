import Anthropic from '@anthropic-ai/sdk'
import type { BrandAnalysis, TypographyConfig } from './types'
import { parseJsonResponse } from './utils'
import { AGENT_MODELS } from './models'

const systemPrompt = `You are a typography expert for data dashboards. Given brand attributes, suggest fonts and sizes compatible with Power BI themes.

Power BI Desktop only reliably renders fonts that are pre-installed on Windows, since custom fonts do not travel with the .pbix/theme file and will silently fall back on other users' machines. Only choose from: Segoe UI, Segoe UI Semibold, Arial, Calibri, Cambria, Georgia, Tahoma, Verdana, Trebuchet MS, Courier New, Consolas, DIN, Helvetica Neue.

Guidelines:
- headerFontFamily may be a semibold/bold-leaning variant (e.g. "Segoe UI Semibold") for visual hierarchy, but must still be a font from the approved list.
- Maintain a clear size hierarchy: titleFontSize > headerFontSize > fontSize > labelFontSize. Keep every size within Power BI's practical dashboard range (8-28pt) — dashboards are dense, oversized type wastes canvas space.
- A "bold"/"playful" tone can justify a larger titleFontSize and a more geometric font (e.g. Trebuchet MS); a "corporate"/"minimal" tone should default to Segoe UI for maximum legibility and familiarity.

Return ONLY valid JSON:
{
  "fontFamily": "Font Name",
  "fontSize": 12,
  "headerFontFamily": "Font Name",
  "headerFontSize": 16,
  "titleFontSize": 20,
  "labelFontSize": 10
}`

export async function runTypographyAgent(
  client: Anthropic,
  brand: BrandAnalysis
): Promise<TypographyConfig> {
  const response = await client.messages.create({
    model: AGENT_MODELS.typography,
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Suggest fonts for a ${brand.tone} ${brand.industry} brand with a ${brand.mood} mood. The brand feel: "${brand.description}"`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJsonResponse<TypographyConfig>(text)
}
