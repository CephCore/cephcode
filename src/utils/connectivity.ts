import { ProviderManager } from '../services/ai/ProviderManager.js'
import { PROVIDER_REGISTRY } from '../services/ai/providerRegistry.js'

export type ConnectivityResult = {
  provider: string
  baseUrl: string
  status: 'ok' | 'error' | 'untested'
  message?: string
}

export async function checkProviderConnectivity(): Promise<ConnectivityResult[]> {
  const manager = ProviderManager.getInstance()
  const config = manager.getSelectedProviderConfig()
  const results: ConnectivityResult[] = []

  // Get unique providers that have an API key or are active
  const providersToCheck = new Set<string>()
  if (config.provider) providersToCheck.add(config.provider)
  if (config.apiKeys) {
    for (const p of Object.keys(config.apiKeys)) {
      providersToCheck.add(p)
    }
  }

  // Also check environment variables
  for (const [id, entry] of Object.entries(PROVIDER_REGISTRY)) {
    if (entry.envKey && process.env[entry.envKey]) {
      providersToCheck.add(id)
    }
  }

  for (const providerId of providersToCheck) {
    const entry = (PROVIDER_REGISTRY as any)[providerId]
    if (!entry) continue

    const baseUrl = manager.getBaseUrlForProvider(providerId as any) || entry.defaultBaseUrl
    const apiKey = manager.getApiKeyForProvider(providerId as any)

    if (!apiKey && !entry.isLocal) {
       results.push({
         provider: entry.label,
         baseUrl,
         status: 'untested',
         message: 'No API key configured'
       })
       continue
    }

    try {
      // Try to fetch models as a health check
      const modelsUrl = entry.modelsUrl || `${baseUrl}/models`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}`, 'x-api-key': apiKey }),
          'Accept': 'application/json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        results.push({
          provider: entry.label,
          baseUrl,
          status: 'ok'
        })
      } else {
        // Some providers might not support /models or return 401 if key is invalid
        const text = await response.text().catch(() => 'Unknown error')
        results.push({
          provider: entry.label,
          baseUrl,
          status: 'error',
          message: `HTTP ${response.status}: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`
        })
      }
    } catch (error) {
      results.push({
        provider: entry.label,
        baseUrl,
        status: 'error',
        message: (error as Error).message
      })
    }
  }

  return results
}
