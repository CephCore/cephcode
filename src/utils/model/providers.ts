import type { ProviderId } from '../../services/ai/providers/ProviderInterface.js'
import { ProviderManager } from '../../services/ai/ProviderManager.js'
import type { AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS } from '../../services/analytics/index.js'

/**
 * Anthropic deployment types — maps to how the Anthropic API is deployed.
 * Only meaningful when the active provider IS Anthropic.
 */
export type APIProvider = 'firstParty' | 'bedrock' | 'vertex' | 'foundry'

/**
 * Returns the Anthropic deployment type. For non-Anthropic providers,
 * returns 'firstParty' as the safest default (matches legacy behavior).
 */
export function getAPIProvider(): APIProvider {
  return ProviderManager.getInstance().getAnthropicProviderType()
}

export function getAPIProviderForStatsig(): AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS {
  return getAPIProvider() as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
}

export function isFirstPartyAnthropicBaseUrl(): boolean {
  return ProviderManager.getInstance().isFirstPartyAnthropicBaseUrl()
}

/**
 * Returns the active provider ID (anthropic, openai, google, deepseek, etc.).
 * Use this to check which provider is active for multi-provider routing.
 *
 * @example
 *   const provider = getActiveProviderId()
 *   if (provider === 'anthropic') { ... Anthropic-specific logic ... }
 *   if (provider === 'openai')   { ... OpenAI-specific logic ... }
 */
export function getActiveProviderId(): ProviderId {
  return ProviderManager.getInstance().getActiveProviderName()
}

/**
 * Returns true if the active provider is Anthropic (any deployment type:
 * firstParty, bedrock, vertex, or foundry). Use to gate Anthropic-only
 * features (beta headers, thinking blocks, web_search_20250305, etc.).
 */
export function isAnthropicProvider(): boolean {
  const provider = getActiveProviderId()
  return provider === 'anthropic'
}
