import type { Command } from '../../commands.js';

const voice = {
  type: 'local',
  name: 'voice',
  description: 'Toggle voice mode. /voice start to begin recording, /voice stop to stop',
  argumentHint: '[start|stop]',
  supportsNonInteractive: false,
  load: () => import('./voice.js'),
} satisfies Command;

export default voice;
