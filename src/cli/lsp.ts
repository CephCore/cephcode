#!/usr/bin/env bun
import { LuluLSPServer } from '../server/lsp.js';

// Run LSP server over stdio
new LuluLSPServer().start();
