import Anthropic from '@anthropic-ai/sdk'
import type { BrandAnalysis, TypographyConfig } from './types'
import { parseJsonResponse } from './utils'

const systemPrompt = `You are a typography expert for data dashboards. Given brand attributes, suggest fonts and sizes compatible with Power BI themes.

Power BI supports these fonts: Segoe UI, Arial, Calibri, Cambria, Georgia, Tahoma, Verdana, Trebuchet MS, Courier New, Consolas, DIN, Helvetica Neue, and system fonts.

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
    model: 'claude-haiku-4-5-20251001',
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
