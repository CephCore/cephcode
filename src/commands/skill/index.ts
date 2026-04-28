import type { Command } from '../../commands.js'

const skill = {
  type: 'local-jsx',
  name: 'skill',
  description: 'List available skills or show skill details',
  argumentHint: '[name]',
  load: () => import('./skill.js'),
} satisfies Command

export default skill
