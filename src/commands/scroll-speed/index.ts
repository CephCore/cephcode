/**
 * Scroll-speed command - minimal metadata only.
 * Implementation is lazy-loaded from scroll-speed.ts to reduce startup time.
 */
import type { Command } from '../../commands.js'

const scrollSpeed = {
  type: 'local-jsx',
  name: 'scroll-speed',
  description: 'Set mouse wheel scroll speed multiplier (1-20). Use /scroll-speed to show current value.',
  immediate: true,
  argumentHint: '[1-20|default]',
  load: () => import('./scroll-speed.js'),
} satisfies Command

export default scrollSpeed
