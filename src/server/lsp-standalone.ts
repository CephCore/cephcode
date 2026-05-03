#!/usr/bin/env bun
import { LuluLSPServer } from './lsp.js'

// Run LSP server over stdio for IDE integration
// Compatible with VS Code, Neovim, Emacs LSP clients
new LuluLSPServer().start()