import Anthropic from '@anthropic-ai/sdk'
import type { BrandAnalysis } from './types'
import { parseJsonResponse } from './utils'

const systemPrompt = `You are an expert brand analyst. Your job is to analyze a user's text description or brand image and extract brand attributes.

Return a JSON object with exactly these fields:
- primaryColor: hex color string (e.g. "#2E86AB")
- secondaryColor: hex color string
- accentColor: hex color string
- tone: one of "corporate", "playful", "minimal", "bold", "elegant"
- industry: the industry or field (e.g. "finance", "healthcare", "tech")
- mood: a one-word mood descriptor (e.g. "professional", "fun", "luxurious")
- description: a short 1-sentence description of the brand feel

Return ONLY valid JSON, no markdown, no explanation.`

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
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJsonResponse<BrandAnalysis>(text)
}
