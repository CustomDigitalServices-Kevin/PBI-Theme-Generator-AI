import Anthropic from '@anthropic-ai/sdk'
import type { PowerBITheme, ValidationResult } from './types'
import { parseJsonResponse } from './utils'

const systemPrompt = `You are a Power BI theme JSON validator. Check the provided theme JSON against the official Power BI theme specification.

Validate:
1. All required fields exist (name, dataColors, background, foreground, tableAccent)
2. dataColors has at least 6 colors
3. All color values are valid hex strings (#RRGGBB or #RGB)
4. Font families are valid for Power BI
5. Font sizes are reasonable (8-72)
6. textClasses has the required sub-objects
7. No invalid or misspelled keys

If there are errors, fix them and return the corrected theme.

Return ONLY valid JSON:
{
  "isValid": true/false,
  "errors": ["error1", "error2"],
  "fixedTheme": { ... the corrected theme if there were errors, or the original if valid ... }
}`

export async function runValidator(
  client: Anthropic,
  theme: PowerBITheme
): Promise<ValidationResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Validate this Power BI theme JSON and fix any issues:\n\n${JSON.stringify(theme, null, 2)}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJsonResponse<ValidationResult>(text)
}
