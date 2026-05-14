/**
 * Goal command - minimal metadata only.
 * Implementation is lazy-loaded from goal.ts to reduce startup time.
 */
import type { Command } from '../../commands.js'

const goal = {
  type: 'local-jsx',
  name: 'goal',
  description: 'Set a session goal shown in the status line. Use /goal to view, /goal <text> to set, /goal clear to remove',
  immediate: true,
  argumentHint: '[text|clear]',
  load: () => import('./goal.js'),
} satisfies Command

export default goal
