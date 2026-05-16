/**
 * CodeIndex Tool
 *
 * Provides semantic-like code search using fuzzy matching.
 * Indexes project files for quick reference during development.
 */

import { z } from 'zod/v4';
import type { ValidationResult } from '../../Tool.js';
import { buildTool, type ToolDef } from '../../Tool.js';
import { CodeIndex, getCodeIndex, resetCodeIndex } from '../../utils/codeIndex/index.js';
import { getCwd } from '../../utils/cwd.js';
import { lazySchema } from '../../utils/lazySchema.js';

const inputSchema = lazySchema(() =>
  z.strictObject({
    action: z.enum(['search', 'index', 'stats', 'clear', 'save', 'load', 'update']).describe('Action to perform'),
    query: z.string().optional().describe('Search query (for search action)'),
    limit: z.number().optional().default(5).describe('Maximum results to return'),
    path: z.string().optional().describe('Path to index (for index/save/load actions, defaults to current directory)'),
  }),
);
type InputSchema = ReturnType<typeof inputSchema>;

const outputSchema = lazySchema(() =>
  z.object({
    action: z.string(),
    results: z
      .array(
        z.object({
          filePath: z.string(),
          content: z.string(),
          score: z.number(),
          lineRange: z.string(),
        }),
      )
      .optional()
      .describe('Search results'),
    stats: z
      .object({
        totalChunks: z.number(),
        indexedFiles: z.number(),
        languageBreakdown: z.record(z.string(), z.number()),
        lastIndexed: z.string().nullable(),
      })
      .optional()
      .describe('Index statistics'),
    indexed: z.number().optional().describe('Number of chunks indexed'),
    cleared: z.boolean().optional().describe('Whether index was cleared'),
    error: z.string().optional().describe('Error message if any'),
  }),
);
type OutputSchema = ReturnType<typeof outputSchema>;

export const CodeIndexTool = buildTool({
  name: 'CodeIndex',
  aliases: [],
  searchHint: 'search code in the project index',
  maxResultSizeChars: 50_000,
  userFacingName() {
    return '';
  },
  get inputSchema(): InputSchema {
    return inputSchema();
  },
  get outputSchema(): OutputSchema {
    return outputSchema();
  },
  isEnabled() {
    return feature('CODE_INDEX') ? true : false;
  },
  isConcurrencySafe() {
    return true;
  },
  isReadOnly() {
    return true;
  },
  async validateInput({ action, query }, _context): Promise<ValidationResult> {
    if (action === 'search' && (!query || query.length < 2)) {
      return {
        result: false,
        error: 'Query must be at least 2 characters for search',
      };
    }
    return { result: true };
  },
  async description() {
    return 'Search and index project code using fuzzy matching. Use "index" to build the index, "search" to query it.';
  },
  async prompt() {
    return 'This tool provides fast code search using fuzzy matching. Index the project once with action=index, then search multiple times with action=search.';
  },
  mapToolResultToToolResultBlockParam(output, toolUseID) {
    if (output.error) {
      return {
        tool_use_id: toolUseID,
        type: 'tool_result',
        content: `Error: ${output.error}`,
        is_error: true,
      };
    }

    const lines: string[] = [`[CodeIndex] action=${output.action}`];

    if (output.results && output.results.length > 0) {
      lines.push(`Found ${output.results.length} results:`);
      for (const r of output.results) {
        lines.push(`\n[${r.filePath}:${r.lineRange}] (score: ${(r.score * 100).toFixed(0)}%)`);
        lines.push(r.content.slice(0, 200) + (r.content.length > 200 ? '...' : ''));
      }
    } else if (output.stats) {
      lines.push(`Index: ${output.stats.totalChunks} chunks, ${output.stats.indexedFiles} files`);
      const langs = Object.entries(output.stats.languageBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang, count]) => `${lang}:${count}`)
        .join(', ');
      if (langs) lines.push(`Languages: ${langs}`);
    } else if (output.indexed !== undefined) {
      lines.push(`Indexed ${output.indexed} code chunks`);
    } else if (output.cleared) {
      lines.push('Index cleared');
    }

    return {
      tool_use_id: toolUseID,
      type: 'tool_result',
      content: lines.join('\n'),
    };
  },
  renderToolUseMessage({ input }) {
    const action = input.action;
    const query = input.query || '';
    return `[CodeIndex] ${action}${query ? ` "${query}"` : ''}`;
  },
  renderToolResultMessage({ output }) {
    if (output.error) return `Error: ${output.error}`;
    if (output.results && output.results.length > 0) {
      return `[CodeIndex] ${output.results.length} results`;
    }
    if (output.stats) {
      return `[CodeIndex] ${output.stats.totalChunks} chunks indexed`;
    }
    if (output.indexed !== undefined) {
      return `[CodeIndex] indexed ${output.indexed} chunks`;
    }
    return `[CodeIndex] done`;
  },
  async call({ action, query, limit = 5, path }, context) {
    const targetPath = path || getCwd();
    const index = getCodeIndex({}, targetPath);

    try {
      switch (action) {
        case 'index': {
          const files = await index.discoverFiles(targetPath);

          // Index files in chunks to avoid blocking
          let indexed = 0;
          for (const file of files) {
            try {
              const content = Bun.file(file).text();
              indexed += index.indexFile(file, content);

              // Yield periodically to avoid blocking
              if (indexed % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
              }
            } catch {
              /* skip */
            }
          }

          return {
            data: {
              action: 'index',
              indexed,
            },
          };
        }

        case 'save': {
          const saved = index.save(targetPath);
          return {
            data: {
              action: 'save',
              saved,
              path: targetPath,
            },
          };
        }

        case 'load': {
          const loaded = index.load(targetPath);
          return {
            data: {
              action: 'load',
              loaded,
              path: targetPath,
              indexed: index.isIndexed,
            },
          };
        }

        case 'update': {
          if (!index.isIndexed) {
            return {
              data: {
                action: 'update',
                error: 'No existing index. Use action=index first.',
              },
            };
          }
          const updated = await index.updateIndex(targetPath);
          // Save after update
          index.save(targetPath);
          return {
            data: {
              action: 'update',
              updated,
              totalChunks: index.size,
            },
          };
        }

        case 'search': {
          if (!index.isIndexed) {
            return {
              data: {
                action: 'search',
                error: 'Index not built. Use action=index first.',
              },
            };
          }

          const results = index.search(query!, limit);
          return {
            data: {
              action: 'search',
              results: results.map(r => ({
                filePath: r.chunk.filePath,
                content: r.chunk.content,
                score: r.score,
                lineRange: `${r.chunk.startLine}-${r.chunk.endLine}`,
              })),
            },
          };
        }

        case 'stats': {
          return {
            data: {
              action: 'stats',
              stats: index.getStats(),
            },
          };
        }

        case 'clear': {
          resetCodeIndex();
          return {
            data: {
              action: 'clear',
              cleared: true,
            },
          };
        }

        default:
          return {
            data: {
              action,
              error: `Unknown action: ${action}`,
            },
          };
      }
    } catch (error) {
      return {
        data: {
          action,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
} satisfies ToolDef<InputSchema, OutputSchema>);
