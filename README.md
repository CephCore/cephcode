# Claude Code

A research fork of Anthropic's Claude Code CLI — a terminal-based AI coding assistant with multi-provider routing, an extensible plugin architecture, and comprehensive tool system.

> This repository is an independent research and development project. It is not affiliated with or endorsed by Anthropic PBC.

## Overview

Claude Code extends the Claude Code CLI into a multi-provider AI platform. It preserves the original terminal interface and tool execution model while adding support for 14 AI providers, 54 built-in tools, 104 slash commands, 14 plugins, and 20 bundled skills.

The project runs on [Bun](https://bun.sh) 1.3+ and targets Windows, macOS, and Linux (including WSL2).

### Key Capabilities

- **Multi-Provider AI** — Unified interface across Anthropic, OpenAI, Google Gemini, OpenRouter, Ollama, and more with seamless provider/model switching.
- **Terminal UI** — React (Ink 6)-based terminal interface with syntax highlighting, scrollback, search, and keyboard navigation.
- **Tool System** — 54 built-in tools covering file operations, shell execution, web search/fetch, git, MCP, subagents, Jupyter notebooks, LSP, structured diff editing, and more.
- **Plugin Architecture** — Extensible plugin system supporting hooks, skills, commands, agents, MCP servers, and custom output styles.
- **Permission Model** — Layered permission system from interactive approval through progressive automation modes (YOLO Lite, YOLO ALLOW, YOLO MAX).
- **Subagent Runtime** — Background AI agents for parallel task execution with lease management, stale recovery, and workspace isolation.
- **MCP Integration** — Model Context Protocol support with OAuth/SSE/stdio transports, tool registry, and channel notifications.
- **Bridge Mode** — WebSocket-based remote collaboration with session sharing and team onboarding.
- **Skill System** — 20 bundled skills (debug, web search, scrapling, commit, code review, and more) plus project-level custom skills.

## Requirements

| Dependency | Version |
|-----------|---------|
| [Bun](https://bun.sh) | 1.3 or newer |
| Git | 2.x or newer |
| OS | Windows, macOS, Linux, or WSL2 |

At least one configured AI provider API key is required for AI functionality.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/JonusNattapong/ClaudeCode.git
cd ClaudeCode

# Install dependencies
bun install

# Build the project
bun run build

# Start a session
bun run src/main.tsx session
```

Development mode with hot reload:

```bash
bun run dev
```

Run the test suite:

```bash
bun test
```

## AI Provider Configuration

The following providers are implemented in `src/services/ai/providers/`:

| Provider | Environment Variable |
|----------|---------------------|
| Anthropic (default) | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Google Gemini | `GOOGLE_GENERATIVE_API_KEY` |
| OpenRouter | `OPENROUTER_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| Ollama | `OLLAMA_HOST` |
| xAI Grok | `XAI_API_KEY` |
| Mistral | `MISTRAL_API_KEY` |
| Groq | `GROQ_API_KEY` |
| Copilot | GitHub token |
| KiloCode | `KILOCODE_API_KEY` |
| OpenCode | `OPENCODE_API_KEY` |
| Cline API | `CLINE_API_KEY` |
| ChatGPT Plus | Session token |

Configure one or more providers via environment variables or `.env` file:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
export GOOGLE_GENERATIVE_API_KEY=...
```

Within the CLI, switch providers and models interactively using `/provider` and `/model` commands.

Refer to [docs/providers.html](docs/providers.html) for detailed configuration instructions.

## Commands, Tools, and Skills

### Slash Commands (104)

The command system covers file operations, git workflows, AI model management, plugin administration, MCP server management, session control, diagnostics, and more. Common commands include:

```
/help              Command reference
/model             Select or inspect AI models
/provider          Switch AI provider
/config            Edit configuration
/permissions       Manage permission settings
/mcp               Manage MCP servers
/agents            Manage subagents
/plugins           Manage plugins
/theme             Change terminal theme
/doctor            Run system diagnostics
/compact           Compact conversation context
/resume            Resume a previous session
/stats             View token usage statistics
```

See [docs/commands.html](docs/commands.html) for the full command reference.

### Built-in Tools (54)

Tools are organized by purpose in `src/tools/`:

- **File Operations**: Read, Edit, Write, Glob, Grep, NotebookEdit, FileEditTool
- **Shell Execution**: BashTool, PowerShell
- **Version Control**: Git
- **Web**: WebFetch, WebSearch, ResearchTool
- **AI & Agents**: Agent, Task, Skill, AskUserQuestion
- **Protocol Integration**: MCPTool, MCPSearchTool, LSP
- **Code Intelligence**: CodeIndex
- **Media**: MediaUnderstanding
- **Scheduling**: ScheduleCronTool
- **Monitoring**: Monitor
- **Persistence**: MemoryTool

See [docs/tools.html](docs/tools.html) for detailed tool documentation.

### Bundled Skills (20)

Skills in `src/skills/bundled/` provide specialized capabilities:

`batch`, `claudeApi`, `claudeApiContent`, `claudeInChrome`, `commit`, `debug`, `index`, `keybindings`, `loop`, `loremIpsum`, `remember`, `scheduleRemoteAgents`, `scrapling`, `simplify`, `skillify`, `stuck`, `updateConfig`, `verify`, `verifyContent`, `webSearch`

See [docs/skills.html](docs/skills.html) for skill usage documentation.

## Plugin System

The plugin system supports third-party and bundled extensions with the following capabilities:

- Commands, agents, skills, and hooks
- MCP server integration
- Custom output styles
- Marketplace installation via `clawdhub.com`

### Included Plugins (14)

`agent-sdk-dev`, `claude-opus-4-5-migration`, `code-review`, `commit-commands`, `dek-opus-4-5-migration`, `explanatory-output-style`, `feature-dev`, `frontend-design`, `hookify`, `learning-output-style`, `plugin-dev`, `pr-review-toolkit`, `ralph-wiggum`, `security-guidance`

Plugin examples reside in `plugins/`. See [plugins/README.md](plugins/README.md) and [docs/plugins.html](docs/plugins.html) for development and usage documentation.

## Permissions and Automation

The permission system operates in tiers:

| Mode | Behavior |
|------|----------|
| **Default** | Interactive approval for each tool execution |
| **YOLO Lite** | Read-only operations auto-approved |
| **YOLO ALLOW** | Most tools auto-approved; dangerous operations prompt |
| **YOLO MAX** | Fully autonomous execution; bypass all confirmations |

Use automation modes only in trusted repositories or disposable sandboxes. See [docs/permissions.html](docs/permissions.html) for configuration details.

## Project Structure

```
src/
  commands/          Slash command implementations and UI (104 commands)
  components/        Terminal UI components (React/Ink)
  context/           React contexts and shared application state
  services/          Core services (AI providers, MCP, analytics, search, plugins, voice, VCR)
  skills/            Skill loading and bundled skill implementations
  tools/             Built-in tool implementations (54 tools)
  utils/             Shared utilities (config, permissions, telemetry, shell, plugins, filesystem)
  native-ts/         TypeScript ports of native/cpp modules (color-diff, file-index, yoga-layout)

docs/                Static HTML documentation site
plugins/             Bundled and example plugin directories
examples/            Example settings, hooks, and policy files
scripts/             Utility and automation scripts
assets/              Media assets
```

## Documentation

Open [docs/index.html](docs/index.html) in a browser for the full documentation site. Key pages:

- [Installation](docs/installation.html)
- [Quick Start](docs/quick-start.html)
- [Configuration](docs/configuration.html)
- [AI Providers](docs/providers.html)
- [Commands Reference](docs/commands.html)
- [Tools Reference](docs/tools.html)
- [Agent System](docs/agents.html)
- [Plugin Guide](docs/plugins.html)
- [Architecture](docs/architecture.html)
- [Troubleshooting](docs/troubleshooting.html)
- [FAQ](docs/faq.html)

### Architecture Deep Dives

- [Provider Pattern](docs/provider-pattern.html)
- [Command System](docs/command-system.html)
- [Tool System](docs/tool-system.html)
- [Permission Model](docs/permission-model.html)
- [Memory System](docs/memory-system.html)
- [Session System](docs/session-system.html)
- [Context Compaction](docs/context-compaction.html)
- [Plugin System](docs/plugin-system.html)
- [Skill System](docs/skill-system.html)
- [MCP Integration](docs/mcp-integration.html)
- [Bridge Mode](docs/bridge-mode.html)
- [Agent System](docs/agent-system.html)

## Windows Notes

This project is developed and tested with Bun on Windows. If you encounter module resolution errors after dependency changes:

```powershell
Remove-Item -Recurse -Force node_modules
bun install
bun run dev
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete version history. The current release is **v2.1.137**.

## License

See [LICENSE.md](LICENSE.md).
