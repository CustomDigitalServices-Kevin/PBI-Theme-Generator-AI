/**
 * Provider-agnostic executor interface. Both the Mistral and Anthropic
 * browser clients implement this so lib/agents/*.ts can call either
 * provider through the same shape — see lib/agents/browserOrchestrator.ts.
 */

export type AIProviderId = 'mistral' | 'anthropic'

export interface AICredentials {
  provider: AIProviderId
  apiKey: string
}

export interface CompleteParams {
  system: string
  userText: string
  imageBase64?: string
  maxTokens: number
  /** JSON Schema for providers that support structured output (Mistral). Ignored by providers that don't. */
  schema?: object
  schemaName: string
}

export interface AIExecutor {
  /** Returns the raw text response (expected to be a JSON string) — parse it with lib/agents/utils.ts parseJsonResponse. */
  complete(params: CompleteParams): Promise<string>
}

export class AICredentialsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AICredentialsError'
  }
}
