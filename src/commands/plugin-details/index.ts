/**
 * Plugin-details command - minimal metadata only.
 * Implementation is lazy-loaded from plugin-details.ts to reduce startup time.
 */
import type { Command } from '../../commands.js'

const pluginDetails = {
  type: 'local-jsx',
  name: 'plugin-details',
  aliases: ['plugin-info'],
  description: 'Show detailed information about an installed plugin including components, MCP servers, skills, hooks, and cost',
  immediate: true,
  argumentHint: '<plugin-name>',
  load: () => import('./plugin-details.js'),
} satisfies Command

export default pluginDetails
