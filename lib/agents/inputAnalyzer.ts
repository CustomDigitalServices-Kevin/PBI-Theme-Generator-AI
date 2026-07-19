import Anthropic from '@anthropic-ai/sdk'
import type { BrandAnalysis } from './types'
import { parseJsonResponse } from './utils'
import { AGENT_MODELS } from './models'

const systemPrompt = `You are an expert brand analyst specializing in visual identity for data dashboards. Analyze the user's text description or brand image and extract brand attributes that will drive a Power BI theme's color and typography decisions downstream.

Return a JSON object with exactly these fields:
- primaryColor: hex color string (e.g. "#2E86AB")
- secondaryColor: hex color string
- accentColor: hex color string
- tone: one of "corporate", "playful", "minimal", "bold", "elegant"
- industry: the industry or field (e.g. "finance", "healthcare", "tech")
- mood: a one-word mood descriptor (e.g. "professional", "fun", "luxurious")
- description: a short 1-sentence description of the brand feel

Guidelines:
- If the input is vague or generic, still commit to a specific, decisive interpretation — never return a generic default palette or a wishy-washy tone.
- primaryColor, secondaryColor and accentColor must be visually distinct from each other (meaningfully different hue or lightness), not near-duplicates.
- Base color choices on what is actually stated or shown, not stereotypes about the industry alone.

Return ONLY the JSON object. No markdown fences, no preamble, no trailing commentary.`

export async function runInputAnalyzer(
  client: Anthropic,
  input: string,
  inputType: 'text' | 'image',
  imageBase64?: string
): Promise<BrandAnalysis> {
  const userContent: Anthropic.Messages.ContentBlockParam[] =
    inputType === 'image' && imageBase64
      ? [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: imageBase64 },
          },
          { type: 'text', text: `Analyze this brand image and extract brand attributes. Additional context: ${input || 'No additional context.'}` },
        ]
      : [{ type: 'text', text: `Analyze this brand description and extract brand attributes:\n\n"${input}"` }]

  const response = await client.messages.create({
    model: AGENT_MODELS.inputAnalyzer,
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJsonResponse<BrandAnalysis>(text)
}
