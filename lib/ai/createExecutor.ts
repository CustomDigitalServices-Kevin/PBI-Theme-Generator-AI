/**
 * Builds an AIExecutor for a given provider + credentials, resolving the
 * correct per-agent model (lib/agents/models.ts). Returns a factory
 * keyed by agent name rather than a single executor, because Anthropic's
 * tiering uses a different model per pipeline step (Haiku for mechanical
 * steps, Sonnet for reasoning-heavy ones) while Mistral uses one model
 * for every step — see lib/agents/models.ts.
 */
import { modelForAgent, type AgentName } from '../agents/models'
import { createMistralExecutor } from './mistralClient'
import { createAnthropicExecutor } from './anthropicClient'
import type { AICredentials, AIExecutor } from './types'

export type ExecutorFactory = (agent: AgentName) => AIExecutor

export function createExecutorFactory(credentials: AICredentials): ExecutorFactory {
  const cache = new Map<string, AIExecutor>()

  return (agent: AgentName) => {
    const model = modelForAgent(credentials.provider, agent)
    const cacheKey = model
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const executor =
      credentials.provider === 'mistral'
        ? createMistralExecutor(credentials.apiKey, model)
        : createAnthropicExecutor(credentials.apiKey, model)

    cache.set(cacheKey, executor)
    return executor
  }
}
