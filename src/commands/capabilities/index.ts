import type { Command } from '../../commands.js'

const capabilities = {
  type: 'local-jsx' as const,
  name: 'capabilities',
  aliases: ['caps'],
  description: 'Show available system capabilities (git, tmux, browser, network, shells, etc.)',
  isEnabled: () => true,
  load: () => import('./capabilities.js'),
} satisfies Command

export default capabilities
