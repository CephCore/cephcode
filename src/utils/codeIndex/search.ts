/**
 * Code search using Fuse.js for fuzzy matching
 *
 * Provides semantic-like search without requiring embeddings.
 * Uses tokenization + Fuse.js for fast, lightweight code search.
 */

import Fuse from 'fuse.js';
import { tokenize } from './tokenizer.js';
import type { CodeChunk, SearchResult } from './types.js';

interface FuseResult {
  item: CodeChunk;
  score: number;
  matchedTerms: string[];
}

// Fuse.js configuration optimized for code search
const DEFAULT_FUSE_OPTIONS: Fuse.IFuseOptions<CodeChunk> = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.4,
  minMatchCharLength: 2,
  keys: [
    { name: 'content', weight: 3 },
    { name: 'metadata.functionName', weight: 5 },
    { name: 'metadata.className', weight: 4 },
    { name: 'filePath', weight: 1 },
    { name: 'metadata.scope', weight: 2 },
  ],
  useExtendedSearch: true,
  ignoreLocation: true,
  findAllMatches: true,
};

/**
 * Tokenize query and return matched terms
 */
export function extractSearchTerms(query: string): string[] {
  return tokenize(query);
}

/**
 * Create a Fuse.js instance for code search
 */
export function createCodeSearch(chunks: CodeChunk[]): Fuse<CodeChunk> {
  return new Fuse(chunks, DEFAULT_FUSE_OPTIONS);
}

/**
 * Search code chunks with Fuse.js
 *
 * @param searcher - Fuse instance
 * @param query - Search query
 * @param limit - Maximum results (default: 10)
 * @param minScore - Minimum score threshold (0-1, lower is better)
 */
export function searchCode(searcher: Fuse<CodeChunk>, query: string, limit = 10, minScore = 0.6): SearchResult[] {
  const results = searcher.search(query, { limit: limit * 2 }); // Get more results for filtering

  const filtered: SearchResult[] = [];
  for (const result of results) {
    // Score is 0-1, lower is better. Convert to relevance (1 is best)
    const relevance = 1 - (result.score ?? 0.5);

    if (relevance >= minScore) {
      const matchedTerms = extractMatchedTerms(result, query);
      filtered.push({
        chunk: result.item,
        score: relevance,
        matchedTerms,
      });

      if (filtered.length >= limit) break;
    }
  }

  return filtered;
}

/**
 * Extract matched terms from Fuse result
 */
function extractMatchedTerms(result: FuseResult, query: string): string[] {
  const terms: string[] = [];
  const queryTerms = extractSearchTerms(query);

  if (result.matches) {
    for (const match of result.matches) {
      if (match.value && match.indices) {
        for (const [start, end] of match.indices) {
          const matched = match.value.slice(start, end + 1);
          if (matched.length >= 2 && !terms.includes(matched)) {
            terms.push(matched);
          }
        }
      }
    }
  }

  // Add query terms that appear in results
  for (const term of queryTerms) {
    const hasMatch = result.item.content.toLowerCase().includes(term);
    if (hasMatch && !terms.includes(term)) {
      terms.push(term);
    }
  }

  return terms.slice(0, 5); // Limit to 5 terms
}

/**
 * Simple exact search fallback (no fuzzy)
 */
export function searchCodeExact(chunks: CodeChunk[], query: string, limit = 10): SearchResult[] {
  const terms = extractSearchTerms(query);
  if (terms.length === 0) return [];

  const scored = new Map<string, { chunk: CodeChunk; score: number; matches: Set<string> }>();

  for (const chunk of chunks) {
    const content = chunk.content.toLowerCase();
    let score = 0;
    const matched = new Set<string>();

    for (const term of terms) {
      if (content.includes(term)) {
        matched.add(term);
        // Score by frequency and position
        let count = 0;
        let pos = 0;
        while ((pos = content.indexOf(term, pos)) !== -1) {
          count++;
          pos += term.length;
        }
        score += count * (1 / (content.length + 1)) * 1000;
      }
    }

    if (score > 0) {
      scored.set(chunk.id, {
        chunk,
        score,
        matches: matched,
      });
    }
  }

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => ({
      chunk: r.chunk,
      score: Math.min(1, r.score),
      matchedTerms: Array.from(r.matches),
    }));
}

/**
 * Highlight matched terms in content
 */
export function highlightMatches(content: string, terms: string[]): string {
  let result = content;
  for (const term of terms) {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    result = result.replace(regex, '[[HIGHLIGHT]]$1[[/HIGHLIGHT]]');
  }
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
