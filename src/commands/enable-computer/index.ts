import type { Command } from '../../commands.js'
import { getIsNonInteractiveSession } from '../../bootstrap/state.js'

const command: Command = {
  name: 'enableComputer',
  aliases: ['computer'],
  description: 'Enable Computer Use tool (Windows only)',
  type: 'local-jsx',
  isEnabled: () => process.platform === 'win32' && !getIsNonInteractiveSession(),
  load: () => import('./enable-computer.js'),
}

export default command
