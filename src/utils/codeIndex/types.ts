/**
 * Codebase Index Types
 *
 * Minimal vector-based code search for Claude Code.
 * Uses in-memory chunks with Fuse.js fallback for fuzzy matching.
 * Real embeddings can be added via Ollama/OpenAI later.
 */

export interface CodeChunk {
  id: string;
  content: string;
  filePath: string;
  language: string;
  startLine: number;
  endLine: number;
  vector?: number[]; // Optional pre-computed embedding
  metadata: {
    functionName?: string;
    className?: string;
    scope?: string;
  };
}

export interface CodeIndexConfig {
  /** Maximum chunks to index (default: 5000) */
  maxChunks: number;
  /** Chunk size in lines (default: 50) */
  chunkSize: number;
  /** File patterns to exclude */
  excludePatterns: string[];
  /** Enable real embeddings (requires Ollama/OpenAI) */
  useEmbeddings: boolean;
  /** Embedding model to use */
  embeddingModel: string;
}

export interface SearchResult {
  chunk: CodeChunk;
  score: number;
  matchedTerms: string[];
}

export const DEFAULT_INDEX_CONFIG: CodeIndexConfig = {
  maxChunks: 5000,
  chunkSize: 50,
  excludePatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.min.js',
    '**/*.map',
  ],
  useEmbeddings: false, // Default to Fuse.js
  embeddingModel: 'nomic-embed-text', // Ollama default
};
