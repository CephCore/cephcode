/**
 * Code tokenizer and chunker
 *
 * Lightweight approach:
 * 1. Splits code by language-specific patterns
 * 2. Groups lines into chunks
 * 3. Extracts metadata (function names, classes)
 */

import { randomUUID } from 'crypto';
import { basename, extname } from 'path';
import type { CodeChunk, CodeIndexConfig } from './types.js';

// Language detection by extension
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.py': 'python',
  '.pyi': 'python',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.kt': 'kotlin',
  '.swift': 'swift',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.lua': 'lua',
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.ps1': 'powershell',
  '.md': 'markdown',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.sql': 'sql',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.vue': 'vue',
  '.svelte': 'svelte',
};

const LANGUAGE_BLOCK_PATTERNS: Record<string, RegExp[]> = {
  // TypeScript/JavaScript: functions, classes, interfaces, arrow functions
  typescript: [
    /^(export\s+)?(async\s+)?function\s+(\w+)/,
    /^(export\s+)?class\s+(\w+)/,
    /^(export\s+)?interface\s+(\w+)/,
    /^(export\s+)?type\s+(\w+)/,
    /^(export\s+)?const\s+(\w+)\s*=/,
    /^(export\s+)?async\s+\w+\s*=\s*\(/,
    /^export\s+\{/,
    /^\s*(public|private|protected)\s+/,
  ],
  javascript: [
    /^(export\s+)?(async\s+)?function\s+(\w+)/,
    /^(export\s+)?class\s+(\w+)/,
    /^(export\s+)?const\s+(\w+)\s*=/,
    /^(export\s+)?async\s+\w+\s*=\s*\(/,
    /^export\s+\{/,
  ],
  python: [
    /^def\s+(\w+)/,
    /^class\s+(\w+)/,
    /^async\s+def\s+(\w+)/,
    /^@(\w+)/, // decorators
    /^if\s+__name__\s*==/,
  ],
  rust: [
    /^fn\s+(\w+)/,
    /^struct\s+(\w+)/,
    /^impl\s+(\w+)/,
    /^enum\s+(\w+)/,
    /^trait\s+(\w+)/,
    /^pub\s+(fn|struct|enum)/,
    /^mod\s+(\w+)/,
  ],
  go: [
    /^func\s+(\w+)/,
    /^func\s+\(\w+\s+\*?\w+\)\s+(\w+)/,
    /^type\s+(\w+)\s+struct/,
    /^type\s+(\w+)\s+interface/,
    /^package\s+(\w+)/,
  ],
};

// Detect language from file extension
export function getLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return EXTENSION_TO_LANGUAGE[ext] || 'text';
}

// Extract metadata from chunk content
function extractMetadata(content: string, language: string): CodeChunk['metadata'] {
  const metadata: CodeChunk['metadata'] = {};

  const patterns = LANGUAGE_BLOCK_PATTERNS[language];
  if (!patterns) return metadata;

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      // Function names
      if (match[2] || match[1]) {
        metadata.functionName = match[2] || match[1];
        break;
      }
      // Class names
      if (content.includes('class') && match[1]) {
        metadata.className = match[1];
      }
    }
  }

  // Try to extract scope from first few lines
  const firstLine = content.split('\n')[0];
  if (firstLine.includes('.')) {
    metadata.scope = firstLine.split('.')[0].trim();
  }

  return metadata;
}

// Tokenize text for search
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

// Create a chunk from lines
function createChunk(lines: string[], filePath: string, language: string, startLine: number): CodeChunk {
  const content = lines.join('\n');
  return {
    id: randomUUID(),
    content,
    filePath,
    language,
    startLine,
    endLine: startLine + lines.length - 1,
    metadata: extractMetadata(content, language),
  };
}

// Split file content into chunks
export function chunkFile(content: string, filePath: string, config: CodeIndexConfig): CodeChunk[] {
  const language = getLanguage(filePath);
  const lines = content.split('\n');
  const chunks: CodeChunk[] = [];

  // Try to split by blocks first
  let currentBlock: string[] = [];
  let blockStartLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBlockStart = isBlockBoundary(line, language);

    if (isBlockStart && currentBlock.length >= config.chunkSize) {
      // Emit current block as chunk
      chunks.push(createChunk(currentBlock, filePath, language, blockStartLine));
      currentBlock = [];
      blockStartLine = i + 1;
    }

    currentBlock.push(line);

    // If chunk is too large, split it
    if (currentBlock.length >= config.chunkSize * 1.5) {
      // Find a good split point (at least half the chunk size)
      const splitAt = Math.floor(config.chunkSize / 2);
      const splitLines = currentBlock.slice(0, splitAt);
      chunks.push(createChunk(splitLines, filePath, language, blockStartLine));
      currentBlock = currentBlock.slice(splitAt);
      blockStartLine += splitAt;
    }
  }

  // Emit remaining block
  if (currentBlock.length > 0) {
    chunks.push(createChunk(currentBlock, filePath, language, blockStartLine));
  }

  return chunks;
}

// Check if line is a block boundary
function isBlockBoundary(line: string, language: string): boolean {
  const trimmed = line.trim();

  // Empty or only whitespace
  if (!trimmed) return false;

  // Common block patterns
  const patterns = LANGUAGE_BLOCK_PATTERNS[language];
  if (patterns) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        return true;
      }
    }
  }

  // General patterns (language-agnostic)
  if (/^(export|public|private|protected)\s+/.test(trimmed)) return true;
  if (/^\/\*\*|\/\/\*|# >>>/.test(trimmed)) return true; // Doc comments
  if (/^---+\s*$/.test(trimmed)) return true; // YAML separator

  return false;
}

// Get supported extensions
export function getSupportedExtensions(): string[] {
  return Object.keys(EXTENSION_TO_LANGUAGE);
}
