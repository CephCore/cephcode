# inResearch Search Provider Setup

Claude Code's `inResearch` research tool now supports multiple search providers with intelligent fallback.

## Provider Priority

The search system prioritizes providers automatically:

1. **SearXNG** (self-hosted, free) - Default choice if configured
2. **DuckDuckGo** (free, no API key) - Always available fallback
3. **Tavily** (API-based) - If `TAVILY_API_KEY` is set
4. **Brave** (API-based) - If `BRAVE_API_KEY` is set

## Configuration

### Option 1: Environment Variables

Set environment variables before starting Claude Code:

```bash
# SearXNG (optional)
export SEARXNG_URL=http://localhost:8888

# API Keys (optional)
export TAVILY_API_KEY=your_tavily_key
export BRAVE_API_KEY=your_brave_key

# Start Claude Code
bun run src/main.tsx session
```

### Option 2: Settings Dialog

From within Claude Code:

1. Open settings: `/config`
2. Navigate to search providers section
3. Add configuration:
   - **SearXNG URL**: `http://localhost:8888` (or your instance)
   - **Tavily API Key**: (optional)
   - **Brave API Key**: (optional)

## SearXNG Setup (Recommended)

### Local Installation (Docker)

```bash
# Pull and run SearXNG container
docker run -d \
  --name searxng \
  -p 8888:8080 \
  -v searxng-data:/etc/searxng \
  searxng/searxng:latest

# SearXNG is now available at http://localhost:8888
```

### Configuration for Claude Code

Set `SEARXNG_URL` to your SearXNG instance:

```bash
export SEARXNG_URL=http://localhost:8888
```

**Benefits:**
- No API key required
- Self-hosted (privacy)
- Free (no rate limits beyond your infrastructure)
- Supports metasearch from multiple engines (Google, Bing, DuckDuckGo, etc.)

## DuckDuckGo (Default Fallback)

**Always available** - No setup required. DuckDuckGo is automatically used if SearXNG is unavailable.

**Benefits:**
- Zero configuration
- No API key needed
- Privacy-focused search
- Reliable fallback

## Tavily API (Optional)

For more advanced search features:

1. Sign up at [tavily.com](https://tavily.com)
2. Get your API key
3. Set environment variable:

```bash
export TAVILY_API_KEY=tvly_xxx...
```

**Benefits:**
- Advanced search depth
- Direct answer extraction
- Image results support
- Response time tracking

## Brave Search API (Optional)

For another API-based alternative:

1. Sign up at [search.brave.com](https://search.brave.com)
2. Get your API key
3. Set environment variable:

```bash
export BRAVE_API_KEY=xxx...
```

## Usage

The research tool will automatically select the best available provider:

```typescript
// In Claude Code REPL
const results = await research.call({
  query: "latest React 19 features"
})

// Returns results from first available provider:
// 1. SearXNG (if configured and online)
// 2. DuckDuckGo (always available)
// 3. Tavily (if API key set)
// 4. Brave (if API key set)
```

## Troubleshooting

### SearXNG Connection Issues

```bash
# Test SearXNG availability
curl http://localhost:8888/search?q=test&format=json

# Check logs if using Docker
docker logs -f searxng
```

### No Results from Any Provider

1. Check internet connectivity
2. Verify provider URLs/API keys are correct
3. Check rate limits (especially for API-based providers)
4. Review provider status pages

### Performance Optimization

For faster searches, SearXNG is recommended as it:
- Avoids API request overhead
- Provides response time < 2 seconds typically
- Supports local caching of results

## Privacy & Security

| Provider | Privacy | Data Collection | Authentication |
|----------|---------|-----------------|-----------------|
| SearXNG | ✅ Best | Minimal | None |
| DuckDuckGo | ✅ Good | Minimal | None |
| Tavily | ⚠️ Good | Standard | API Key |
| Brave | ⚠️ Good | Standard | API Key |

**Recommendation:** Use SearXNG for maximum privacy when self-hosting, or DuckDuckGo for reliable free fallback with reasonable privacy.

## Advanced Configuration

### Custom SearXNG Instance

If you have a SearXNG instance with custom settings:

```bash
# Point to your instance
export SEARXNG_URL=https://search.example.com

# Claude Code will use your custom instance
```

### Multi-Region Setup

```bash
# Primary SearXNG
export SEARXNG_URL=http://searxng-primary:8888

# Secondary falls back to DuckDuckGo automatically
```

## See Also

- [SearXNG Documentation](https://docs.searxng.org/)
- [DuckDuckGo Documentation](https://duckduckgo.com/)
- [Tavily API Docs](https://docs.tavily.com/)
- [Brave Search API](https://api.search.brave.com/)
