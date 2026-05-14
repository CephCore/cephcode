import { readFileSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import isEqual from 'lodash-es/isEqual.js'
import memoize from 'lodash-es/memoize.js'
import { join } from 'path'
import { z } from 'zod/v4'
import { OAUTH_BETA_HEADER } from '../../constants/oauth.js'
import { getAnthropicClient } from '../../services/api/client.js'
import { isClaudeAISubscriber } from '../auth.js'
import { logForDebugging } from '../debug.js'
import { getClaudeConfigHomeDir } from '../envUtils.js'
import { safeParseJSON } from '../json.js'
import { lazySchema } from '../lazySchema.js'
import { isEssentialTrafficOnly } from '../privacyLevel.js'
import { jsonStringify } from '../slowOperations.js'
import { getActiveProviderId, getAPIProvider, isFirstPartyAnthropicBaseUrl } from './providers.js'

// .strip() — don't persist internal-only fields (mycro_deployments etc.) to disk
const ModelCapabilitySchema = lazySchema(() =>
  z
    .object({
      id: z.string(),
      max_input_tokens: z.number().optional(),
      max_tokens: z.number().optional(),
    })
    .strip(),
)

const CacheFileSchema = lazySchema(() =>
  z.object({
    models: z.array(ModelCapabilitySchema()),
    timestamp: z.number(),
  }),
)

export type ModelCapability = z.infer<ReturnType<typeof ModelCapabilitySchema>>

function getCacheDir(): string {
  return join(getClaudeConfigHomeDir(), 'cache')
}

function getCachePath(): string {
  return join(getCacheDir(), 'model-capabilities.json')
}

function isModelCapabilitiesEligible(): boolean {
  if (process.env.USER_TYPE !== 'ant') return false
  if (getAPIProvider() !== 'firstParty') return false
  if (!isFirstPartyAnthropicBaseUrl()) return false
  return true
}

// Longest-id-first so substring match prefers most specific; secondary key for stable isEqual
function sortForMatching(models: ModelCapability[]): ModelCapability[] {
  return [...models].sort(
    (a, b) => b.id.length - a.id.length || a.id.localeCompare(b.id),
  )
}

// Keyed on cache path so tests that set CLAUDE_CONFIG_DIR get a fresh read
const loadCache = memoize(
  (path: string): ModelCapability[] | null => {
    try {
      // eslint-disable-next-line custom-rules/no-sync-fs -- memoized; called from sync getContextWindowForModel
      const raw = readFileSync(path, 'utf-8')
      const parsed = CacheFileSchema().safeParse(safeParseJSON(raw, false))
      return parsed.success ? parsed.data.models : null
    } catch {
      return null
    }
  },
  path => path,
)

export function getModelCapability(model: string): ModelCapability | undefined {
  // Anthropic first-party path: use cached capabilities from API
  if (isModelCapabilitiesEligible()) {
    const cached = loadCache(getCachePath())
    if (cached && cached.length > 0) {
      const m = model.toLowerCase()
      const exact = cached.find(c => c.id.toLowerCase() === m)
      if (exact) return exact
      return cached.find(c => m.includes(c.id.toLowerCase()))
    }
  }

  // Non-Anthropic providers: return known capabilities from provider registry
  const providerId = getActiveProviderId()
  if (providerId !== 'anthropic') {
    const modelLower = model.toLowerCase()
    // Known context windows for popular non-Anthropic models
    const KNOWN_CAPABILITIES: Record<string, ModelCapability> = {
      'deepseek-v4-pro': { id: 'deepseek-v4-pro', max_input_tokens: 1_000_000, max_tokens: 128_000 },
      'deepseek-v4-flash': { id: 'deepseek-v4-flash', max_input_tokens: 1_000_000, max_tokens: 128_000 },
      'gpt-5.5': { id: 'gpt-5.5', max_input_tokens: 1_050_000, max_tokens: 128_000 },
      'gpt-5.5-pro': { id: 'gpt-5.5-pro', max_input_tokens: 1_050_000, max_tokens: 128_000 },
      'gemini-3.1-pro': { id: 'gemini-3.1-pro', max_input_tokens: 2_000_000, max_tokens: 128_000 },
      'gemini-3.1-flash': { id: 'gemini-3.1-flash', max_input_tokens: 2_000_000, max_tokens: 128_000 },
    }
    // Try exact match first, then substring match
    for (const [key, cap] of Object.entries(KNOWN_CAPABILITIES)) {
      if (modelLower.includes(key)) return cap
    }
  }

  return undefined
}

export async function refreshModelCapabilities(): Promise<void> {
  if (!isModelCapabilitiesEligible()) return
  if (isEssentialTrafficOnly()) return

  try {
    const anthropic = await getAnthropicClient({ maxRetries: 1 })
    const betas = isClaudeAISubscriber() ? [OAUTH_BETA_HEADER] : undefined
    const parsed: ModelCapability[] = []
    for await (const entry of anthropic.models.list({ betas })) {
      const result = ModelCapabilitySchema().safeParse(entry)
      if (result.success) parsed.push(result.data)
    }
    if (parsed.length === 0) return

    const path = getCachePath()
    const models = sortForMatching(parsed)
    if (isEqual(loadCache(path), models)) {
      logForDebugging('[modelCapabilities] cache unchanged, skipping write')
      return
    }

    await mkdir(getCacheDir(), { recursive: true })
    await writeFile(path, jsonStringify({ models, timestamp: Date.now() }), {
      encoding: 'utf-8',
      mode: 0o600,
    })
    loadCache.cache.delete(path)
    logForDebugging(`[modelCapabilities] cached ${models.length} models`)
  } catch (error) {
    logForDebugging(
      `[modelCapabilities] fetch failed: ${error instanceof Error ? error.message : 'unknown'}`,
    )
  }
}
