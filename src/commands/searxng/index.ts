import type { Command } from '../../commands.js';

const searxng = {
  type: 'local',
  name: 'searxng',
  description: 'Start, stop, or check status of the local SearXNG Docker container',
  argumentHint: '<on|off|status>',
  supportsNonInteractive: true,
  load: () => import('./searxng.js'),
} satisfies Command;

export default searxng;
