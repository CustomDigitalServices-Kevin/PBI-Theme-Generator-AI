/**
 * Browser-side Mistral client. @mistralai/mistralai officially supports
 * evergreen browsers (Chrome/Safari/Edge/Firefox) per its RUNTIMES.md —
 * verified by inspecting the published package before writing this file.
 * The Mistral API allows direct browser calls (no CORS proxy needed).
 *
 * Structured output: when a JSON Schema is provided, uses Custom
 * Structured Outputs (responseFormat: json_schema, strict: true) — the
 * exact field names (jsonSchema.schemaDefinition, not .schema) were
 * confirmed against the SDK's own published TypeScript types, not
 * guessed from docs. Falls back to JSON Mode (json_object) when no
 * schema is given (themeBuilder / validator — see lib/agents/schemas.ts
 * for why those two don't use a strict schema).
 */
import { Mistral } from '@mistralai/mistralai'
import type { ContentChunk } from '@mistralai/mistralai/models/components'
import type { AIExecutor, CompleteParams } from './types'

export function createMistralExecutor(apiKey: string, model: string): AIExecutor {
  const client = new Mistral({ apiKey })

  return {
    async complete(params: CompleteParams): Promise<string> {
      const content: ContentChunk[] = []
      if (params.imageBase64) {
        content.push({ type: 'image_url', imageUrl: `data:image/png;base64,${params.imageBase64}` })
      }
      content.push({ type: 'text', text: params.userText })

      const response = await client.chat.complete({
        model,
        maxTokens: params.maxTokens,
        messages: [
          { role: 'system', content: params.system },
          { role: 'user', content },
        ],
        responseFormat: params.schema
          ? {
              type: 'json_schema',
              jsonSchema: {
                name: params.schemaName,
                schemaDefinition: params.schema as Record<string, unknown>,
                strict: true,
              },
            }
          : { type: 'json_object' },
      })

      const message = response.choices?.[0]?.message
      const text = typeof message?.content === 'string' ? message.content : ''
      if (!text) throw new Error('Mistral returned an empty response')
      return text
    },
  }
}
