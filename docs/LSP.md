# Lulu LSP (Language Server Protocol)

AI pair programming assistance integrated with your IDE.

## Features

- `/ask` - Ask Lulu about selected code
- `/explain` - Explain code selections
- `/fix` - Fix issues in code
- `/refactor` - Refactor code intelligently
- `/generate` - Generate code from descriptions

## Usage

### VS Code

1. Install the extension from `.vscode/`
2. Open a file and select code
3. Use commands: `Ctrl+Shift+P` → "Lulu: Ask/Explain/Fix"

### Neovim (with builtin LSP)

```lua
-- In init.lua
vim.lsp.start_client {
  name = 'lulu-lsp',
  cmd = { 'bun', 'src/server/lsp-standalone.ts' },
  filetypes = { 'javascript', 'typescript', 'python', 'go', 'rust' },
}
```

### Emacs

```elisp
;; In init.el
(require 'lsp-mode)
(add-to-list 'lsp-language-id-configuration '(typescript-mode . "typescript"))
 lsp (buffers))
```

### Stdin/Stdout Mode

Run directly:
```bash
bun src/server/lsp-standalone.ts
```

## LSP Capabilities

- Text synchronization (incremental)
- Completion provider (trigger `/` for commands)
- Hover provider (shows Lulu info)
- Code action provider (quick fixes)
- Execute command provider (AI commands)

## Integration

Connect to the existing Lulu agent system via:
- WebSocket (same connection as Gateway)
- IPC calls to running agent
- New isolated agent sessions