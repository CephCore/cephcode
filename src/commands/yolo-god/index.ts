import type { Command } from '../../commands.js'

const yoloGod = {
  type: 'local-jsx',
  name: 'yolo-god',
  description: 'Enable YOLO God mode (maximum power - no limits)',
  load: () => import('./yolo-god.js'),
} satisfies Command

export default yoloGod
