import type { Command } from '../../commands.js'

const yolo = {
  type: 'local-jsx',
  name: 'yolo',
  description: 'Manage YOLO mode tiers and view stats',
  load: () => import('./yolo.js'),
} satisfies Command

export default yolo
