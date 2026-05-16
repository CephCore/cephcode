import { OpenAICompatibleProvider } from './OpenAICompatibleProvider.js';
import type { ProviderId } from './ProviderInterface.js';

export class OllamaProvider extends OpenAICompatibleProvider {
  constructor() {
    super(
      'ollama' as ProviderId,
      'Ollama (Local)',
      'OLLAMA_API_KEY',
      'http://localhost:11434/v1',
      false, // requiresApiKey = false
    );
  }
}
