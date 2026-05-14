import type { Command } from '../../commands.js'

const agents = {
  type: 'local-jsx',
  name: 'agents',
  description: 'Manage agent configurations',
  load: () => import('./agents.js'),
} satisfies Command

/**
 * Check if agent view is disabled via settings or environment variable.
 * Called by the entrypoint before opening agent view.
 */
export function isAgentViewDisabled(): boolean {
  if (process.env.CLAUDE_CODE_DISABLE_AGENT_VIEW === 'true') return true
  if (process.env.CLAUDE_CODE_DISABLE_AGENT_VIEW === '1') return true
  return false
}

export default agents
