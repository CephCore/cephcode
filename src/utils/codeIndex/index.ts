/**
 * Codebase Index - Barrel export
 *
 * Lightweight code indexing for Claude Code.
 * Provides fuzzy search over code chunks without external dependencies.
 */

export { CodeIndex, getCodeIndex, resetCodeIndex } from './indexer.js';
export { createCodeSearch, extractSearchTerms, searchCode, searchCodeExact } from './search.js';
export { chunkFile, getLanguage, getSupportedExtensions, tokenize } from './tokenizer.js';
export type { CodeChunk, CodeIndexConfig, SearchResult } from './types.js';
export { DEFAULT_INDEX_CONFIG } from './types.js';

import { getCodeIndex } from './indexer.js';

/**
 * Quick search function for interactive use
 */
export async function quickSearch(query: string, limit = 5) {
  const index = getCodeIndex();
  if (!index.isIndexed) {
    return { error: 'Index not ready. Call indexDirectory first.' };
  }
  return index.search(query, limit);
}

/**
 * Initialize index with project files
 */
export async function initializeProjectIndex(
  dirPath: string,
  onProgress?: (indexed: number, total: number, current: string) => void,
) {
  const index = getCodeIndex();
  const count = await index.indexDirectory(dirPath, onProgress);
  return { chunksIndexed: count, stats: index.getStats() };
}
