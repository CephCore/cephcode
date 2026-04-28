import type { Command } from '../../commands.js'

const setpath = {
  type: 'local-jsx',
  name: 'setpath',
  description: 'Change the working directory',
  argumentHint: '<path>',
  load: () => import('./setpath.js'),
} satisfies Command

export default setpath
