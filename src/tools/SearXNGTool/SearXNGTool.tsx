import { Text } from "ink";
import { buildTool } from "../../Tool.js";
import { lazySchema } from "../../utils/lazySchema.js";
import { z } from "zod/v4";
import React from "react";

const SEARXNG_BASE = process.env.SEARXNG_URL || "http://localhost:8888";

interface SearXNGData {
  results?: any[];
  formattedResults?: string;
  count?: number;
  duration?: number;
  error?: string;
}

// Helper: Framework passes Output directly to render/map functions
// But sometimes it may be wrapped. Handle both cases.
function unwrapToolData(content: any): SearXNGData {
  if (!content) return {};
  // If content has count/duration/results directly → it IS the data
  if ('count' in content || 'results' in content || 'error' in content) {
    return content as SearXNGData;
  }
  // If content has .data → unwrap once
  if (content.data && typeof content.data === 'object') {
    return content.data as SearXNGData;
  }
  return content as SearXNGData;
}

const inputSchema = lazySchema(() =>
  z.object({
    query: z.string().min(1).describe("The search query to send to SearXNG"),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .describe("Maximum number of SearXNG results to return"),
  }),
);

type InputSchema = ReturnType<typeof inputSchema>;

export const SearXNGTool = buildTool({
  name: "searxng_search",
  searchHint: "search the web using local SearXNG instance",

  get inputSchema(): InputSchema {
    return inputSchema();
  },

  async description({ query }) {
    return `Searching SearXNG for: ${query}`;
  },

  maxResultSizeChars: 100_000,

  async prompt() {
    return "Search the web using SearXNG";
  },

  async call({ query, maxResults = 10 }, _context) {
    const startTime = performance.now();
    try {
      const url = `${SEARXNG_BASE}/search?q=${encodeURIComponent(query)}&format=json&pageno=1`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        const elapsed = performance.now() - startTime;
        return {
          data: {
            results: [],
            formattedResults: `SearXNG error: ${response.status} ${response.statusText}`,
            count: 0,
            duration: elapsed,
            error: `HTTP ${response.status}`,
          },
        };
      }

      const data = (await response.json()) as any;
      const rawResults = Array.isArray(data.results) ? data.results : [];
      const results = rawResults.slice(0, maxResults);
      const elapsed = performance.now() - startTime;

      const formattedResults = results
        .map((r: any, i: number) => {
          const title = r.title || "Untitled";
          const urlStr = r.url || "";
          const content = r.content || "";
          return `${i + 1}. [${title}](${urlStr})\n   ${content}`;
        })
        .join("\n\n");

      return {
        data: {
          results,
          formattedResults: formattedResults || "No results found.",
          count: results.length,
          duration: elapsed,
        },
      };
    } catch (error: any) {
      const elapsed = performance.now() - startTime;
      return {
        data: {
          results: [],
          formattedResults: `SearXNG connection failed: ${error?.message || "Unknown error"}`,
          count: 0,
          duration: elapsed,
          error: error?.message || "Unknown error",
        },
      };
    }
  },

  mapToolResultToToolResultBlockParam(result, toolUseID) {
    const data = unwrapToolData(result);

    return {
      type: "tool_result",
      tool_use_id: toolUseID,
      content: data.formattedResults || "No SearXNG results found.",
    };
  },

  renderToolUseMessage({ query }) {
    return `Searching SearXNG for: ${query}`;
  },

  renderToolResultMessage(result) {
    const data = unwrapToolData(result);

    const count = data.count ?? 0;
    const duration = data.duration ?? 0;
    const errorMsg = data.error;

    if (errorMsg) {
      return (
        <Text>
          SearXNG Error: {errorMsg} ({(duration / 1000).toFixed(2)}s)
        </Text>
      );
    }

    return (
      <Text>
        Found {count} results in {(duration / 1000).toFixed(2)}s
      </Text>
    );
  },
});
