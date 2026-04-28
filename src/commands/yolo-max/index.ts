import type { Command } from '../../commands.js'

const yoloMax = {
  type: 'local-jsx',
  name: 'yolo-max',
  description: 'Enable YOLO Max mode (auto-allow + bypass sandbox)',
  load: () => import('./yolo-max.js'),
} satisfies Command

export default yoloMax
