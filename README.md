# Claude Code (Redesigned)

Claude Code is a redesigned agentic coding CLI, created by **Dek1milliontoken**, focused on practical multi-provider AI workflows, extensible tooling, and operational task orchestration.

## Legal Notice

Before using this project, review:

- [NOTICE.md](docs/NOTICE.md) — 2-minute summary of legal risks
- [LEGAL.md](docs/LEGAL.md) — Complete disclaimer and indemnification
- [LICENSE.md](LICENSE.md)

---

## Overview

This project provides a command-line environment for software development workflows powered by AI agents. It combines:

- **Multi-provider model integration** — Anthropic, OpenAI, Google, OpenRouter, Ollama, and more
- **Built-in execution and development tools** — Read, Edit, Write, Glob, Grep, Bash, Git, Web operations, MCP
- **Plugin and skill extensibility** — Extend the CLI with custom plugins and skills
- **Kanban-based task orchestration** — Persistent task board with HTTP dashboard and autonomous worker support
- **Subagent and background task execution** — Delegate work to AI agents that operate asynchronously
- **Bridge mode for remote collaboration** — Share session URLs with teammates for real-time collaboration

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Terminal UI                          │
│                     (Ink / React / TUI)                     │
├─────────────────────────────────────────────────────────────┤
│                    Command Handler Layer                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │  Files   │ │   Git    │ │  MCP     │ │   Agent      │    │
│  │ Commands │ │Commands  │ │ Servers  │ │  System      │    │
├─────────────────────────────────────────────────────────────┤
│                    AI Provider Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │Anthropic │ │ OpenAI   │ │ Google   │ │  OpenRouter  │    │
│  │Provider  │ │Provider  │ │Provider  │ │   Provider   │    │
├─────────────────────────────────────────────────────────────┤
│                    Core Services                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │Provider  │ │Session   │ │Permission│ │   Plugin     │    │
│  │Registry  │ │Manager   │ │Manager   │ │   Manager    │    │
├─────────────────────────────────────────────────────────────┤
│                    Data & Storage                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │  Config  │ │ Sessions │ │ History  │ │   Kanban    │    │
└─────────────────────────────────────────────────────────────┘
```

### Key Modules

| Directory | Purpose |
|-----------|---------|
| `src/services/ai/` | Multi-provider AI system (registry, manager, adapters) |
| `src/infra/tools/` | 40+ built-in tools (Read, Edit, Write, Glob, Grep, Bash, etc.) |
| `src/commands/` | 100+ slash commands registered via `registerCommand()` |
| `src/utils/kanban/` | Kanban board: CRUD, dashboard server, worker runtime |
| `src/plugins/` | Plugin system with hook points (PreToolUse, PostPrompt, etc.) |
| `src/bridge/` | Remote collaboration via WebSocket |

---

## Installation

```bash
git clone https://github.com/JonusNattapong/ClaudeCode.git
cd ClaudeCode
bun install
```

### Runtime Requirements

- **Bun** 1.x or **Node.js** 22+
- **Platform**: macOS, Linux, Windows (Git Bash / WSL2 recommended)

---

## Quick Start

Start a CLI session:

```bash
bun run src/main.tsx session
```

Inside the session, use slash commands:

```
/help                              # List all commands
/model claude-sonnet-4              # Switch model
/provider list                     # Show available providers
/config                            # Open settings editor
/doctor                            # Run diagnostics
```

---

## Configuration

Set provider API keys as environment variables:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export GOOGLE_API_KEY="..."
export OPENROUTER_API_KEY="..."
```

Or configure via `/provider set` inside a session:

```bash
/provider set anthropic claude-sonnet-4-20250514
/provider set openai gpt-4o
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for full configuration options.

---

## Provider System

Claude Code supports multiple AI providers through a unified adapter interface:

| Provider | Models | Setup |
|----------|--------|-------|
| **Anthropic** | Claude Opus 4, Sonnet 4, Haiku 4 | `ANTHROPIC_API_KEY` |
| **OpenAI** | GPT-4o, GPT-4o Mini, o1, o3 | `OPENAI_API_KEY` |
| **Google** | Gemini 2.5 Pro/Flash, Flash-Lite | `GOOGLE_API_KEY` |
| **OpenRouter** | 100+ models via single key | `OPENROUTER_API_KEY` |
| **Ollama** | Local models (Llama, Mistral, etc.) | `OLLAMA_HOST` (default `http://localhost:11434`) |

Switch providers with `/provider` commands or the model picker (`/model`).

---

## Slash Commands

### Session & Model

| Command | Description |
|---------|-------------|
| `/model [name]` | Switch AI model (opens picker if no arg) |
| `/provider` | Manage providers (list, set, configure keys) |
| `/resume` | Resume a previous session |
| `/new` | Start a fresh conversation |
| `/continue` | Continue the most recent session |
| `/exit` | Exit the current session |
| `/save [name]` | Save session with custom name |

### Task Orchestration

| Command | Description |
|---------|-------------|
| `/kanban init` | Initialize Kanban board |
| `/kanban list` | List all tasks |
| `/kanban create "Task" --status ready` | Create a task |
| `/kanban move <id> running` | Move task to a status |
| `/kanban complete <id> "evidence"` | Mark task done with evidence |
| `/kanban fail <id> --reason "msg"` | Fail a task |
| `/kanban server` | Launch HTTP dashboard on port 3000 |
| `/kanban worker --worker <name> --loop` | Start autonomous worker |
| `/kanban workers` | List registered workers |
| `/kanban artifact list <taskId>` | List task artifacts |
| `/kanban worker recover-stale` | Clear expired task leases |

### Tools & Execution

| Command | Description |
|---------|-------------|
| `/cost` | Show token usage and cost |
| `/context` | Show context window usage |
| `/diff` | View uncommitted changes |
| `/commit` | Create a git commit |
| `/commit-push-pr` | Commit, push, and open PR |
| `/branch [name]` | Create a new branch |
| `/compact` | Manually compact context |
| `/effort [level]` | Adjust thinking effort |

### Agent System

| Command | Description |
|---------|-------------|
| `/agent [prompt]` | Spawn a sub-agent to handle a task |
| `/agents` | Inspect and manage active agents |
| `/advisor` | Request AI advice on current task |
| `/ultraplan` | Ultra-deep planning mode |
| `/ultrareview` | Comprehensive code review |

### Plugins & Skills

| Command | Description |
|---------|-------------|
| `/plugin` | Plugin marketplace and management |
| `/plugins` | Alias for plugin management |
| `/skills` | Skills management |
| `/skill` | Alias for skills |
| `/reload-plugins` | Reload all plugins |

### Remote Collaboration

| Command | Description |
|---------|-------------|
| `/bridge` | Enter bridge mode (share session URL) |
| `/remote-control` | Enable remote control from web |
| `/team-onboarding` | Generate team onboarding guide |

### MCP Integration

| Command | Description |
|---------|-------------|
| `/mcp` | MCP server management |
| `/mcp-serve` | Start an MCP server |

Run `/help` inside a session for the full command list.

---

## Kanban Workflow

The Kanban system provides persistent task tracking with an HTTP dashboard and autonomous worker support.

### Basic Flow

```bash
/kanban init
/kanban create "Implement feature X" --status ready
/kanban create "Write tests" --status todo --blocked-by <task-id>
/kanban list
/kanban move <task-id> running
/kanban complete <task-id> "Implemented and validated"
```

### Dashboard

Launch the visual dashboard:

```bash
/kanban server
# Opens at http://localhost:3000
```

Features: task board with columns, drag-and-drop, artifact viewer, worker status, event timeline.

### Worker Automation

Workers run autonomously and can be configured with custom commands:

```bash
# Start a worker that continuously claims ready/todo tasks
/kanban worker --worker builder --loop --statuses ready,todo --cmd-argv '["bun","run","build"]'

# One-shot with custom lease TTL (5 minutes)
/kanban worker --worker w1 --once --lease-minutes 5

# Send heartbeat to extend lease
/kanban worker heartbeat <taskId> [workerId]

# Fail a task (releases lease, increments retry)
/kanban worker fail <taskId> --reason "Build error: tsconfig missing"

# Recover all stale/expired leases
/kanban worker recover-stale
```

#### Lease Safety

- Tasks with active leases from another worker **cannot be claimed**
- Re-claiming your own task **extends** the lease (heartbeat behavior)
- Expired leases can be reclaimed or recovered via `recover-stale`
- Terminal states (`done`, `archived`, `fully-failed`) **block claiming**
- Failing a task clears its lease and increments the retry counter

---

## Plugin System

Plugins extend Claude Code with custom skills and hooks.

### Structure

```
plugin-name/
├── .claude-plugin/
│   ├── plugin.json     # Manifest (name, version, hooks, skills)
│   ├── skills/        # Skill implementations
│   └── hooks/          # Hook handlers
├── marketplace.json
└── README.md
```

### Hook Points

- `PreToolUse` — Modify or intercept tool calls before execution
- `PostToolUse` — Process tool results after execution
- `PreBash` — Validate or transform shell commands
- `PostPrompt` — Modify the final prompt sent to the model
- `PreAcceptEdit` — Approve or reject edits before applying

### Available Plugins

Built-in skill packages (in `plugins/`):
- `commit-commands` — Commit, push, and PR commands
- `code-review` — PR review toolkit
- `feature-dev` — Guided feature development
- `frontend-design` — Premium web UI/UX design
- `hookify` — Hook framework for extensibility
- `security-guidance` — Security best practices

See [docs/COMMANDS.md](docs/COMMANDS.md) for the full plugin command reference.

---

## Development

### Build & Test

```bash
bun install              # Install dependencies
bun run build            # Production build -> dist/
bun run dev              # Dev mode with --watch
bun test                 # Run all tests
bun x tsc --noEmit       # TypeScript type check
```

### Run Targeted Tests

```bash
bun test src/utils/kanban/                        # Kanban tests
bun test src/utils/kanban/kanban.test.ts          # Specific file
```

### Linting & Formatting

```bash
bun run lint              # Lint code
bun run format            # Format code
```

### Debug

```bash
DEBUG=1 bun run src/main.tsx session
DEBUG=provider:anthropic bun run src/main.tsx session
```

Inside a session:
- `/status` — Show internal state
- `/doctor` — Run diagnostics and auto-fix
- `/context` — View context window usage

---

## Project Structure

```
src/
├── main.tsx              # Entry point & CLI bootstrap
├── cli/                  # CLI commands & wiring
├── commands/             # 100+ slash command implementations
├── services/ai/          # Multi-provider AI system
│   ├── providerRegistry.ts
│   ├── ProviderManager.ts
│   └── providers/       # Provider adapters (Anthropic, OpenAI, Google, etc.)
├── infra/tools/          # 40+ built-in tools
├── utils/kanban/         # Kanban board system
│   ├── kanban.ts         # Core CRUD operations
│   ├── store.ts          # JSON file I/O
│   ├── server.ts         # HTTP dashboard + REST API
│   ├── worker.ts         # Worker runtime
│   ├── workers.ts        # Durable worker registry
│   └── types.ts          # Shared types
├── plugins/              # Plugin system
├── bridge/               # Remote collaboration
├── tools/                # Tool implementations
├── state/                # Session state management
├── history.ts            # Conversation history
└── types/                # TypeScript types

docs/
├── ARCHITECTURE.md       # System architecture
├── COMMANDS.md           # Slash command reference
├── CONFIGURATION.md      # Configuration options
├── DEVELOPMENT.md        # Development guide
├── EXAMPLES.md           # Coding principles & examples
├── TESTING.md            # Testing strategy
├── TROUBLESHOHOOTING.md  # Common issues & fixes
└── USAGE.md             # Usage patterns

plugins/                  # Plugin & skill packages
```

---

## Troubleshooting

### CRLF Line Ending Bug (Windows)

On Windows, the Edit tool may convert files to CRLF, which corrupts template literals in Bun's QuickJS TS parser. If you see "Unexpected end of file" errors:

```bash
python -c "import sys; data=open('file.ts','rb').read(); open('file.ts','wb').write(data.replace(b'\r',b''))"
```

### Gateway Won't Start

```bash
pnpm build           # Ensure TypeScript compiled
# Check port availability
ss -ltnp | rg 18789
```

### Test Failures

- Check Node/Bun version (22+ recommended)
- Increase timeout if needed
- Run `pnpm test:force` for retries
- Check for race conditions in test suite

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more solutions.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and components |
| [docs/COMMANDS.md](docs/COMMANDS.md) | Full slash command reference |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | Configuration options |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Development workflow |
| [docs/TESTING.md](docs/TESTING.md) | Testing strategy |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues |
| [docs/API.md](docs/API.md) | API reference |
| [docs/LSP.md](docs/LSP.md) | LSP integration |
| [docs/kanban-workers.md](docs/kanban-workers.md) | Kanban worker system |

---

## Attribution

This redesigned Claude Code distribution is created and maintained by **Dek1milliontoken**.