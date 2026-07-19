/**
 * Browser-side Anthropic client (BYOK — bring your own key). Uses the
 * documented `dangerouslyAllowBrowser` flag, which adds the
 * `anthropic-dangerous-direct-browser-access` header and enables CORS
 * requests directly from the browser to the Anthropic API — confirmed
 * against this project's own installed @anthropic-ai/sdk type
 * declarations (client.d.ts) before writing this file, not assumed.
 *
 * The user's key is never sent anywhere except directly to
 * api.anthropic.com from the user's own browser — no CDS server is
 * involved in this request path.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { AIExecutor, CompleteParams } from './types'

export function createAnthropicExecutor(apiKey: string, model: string): AIExecutor {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  return {
    async complete(params: CompleteParams): Promise<string> {
      const userContent: Anthropic.Messages.ContentBlockParam[] = params.imageBase64
        ? [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: params.imageBase64 } },
            { type: 'text', text: params.userText },
          ]
        : [{ type: 'text', text: params.userText }]

      const response = await client.messages.create({
        model,
        max_tokens: params.maxTokens,
        system: params.system,
        messages: [{ role: 'user', content: userContent }],
      })

      const block = response.content[0]
      if (block.type !== 'text' || !block.text) throw new Error('Anthropic returned an empty response')
      return block.text
    },
  }
}
