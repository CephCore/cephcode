/**
 * /dashboard command — Fullscreen Swarm & Workspace TUI Dashboard.
 */

import type { Command } from '../../commands.js';

const dashboard: Command = {
  type: 'local-jsx',
  name: 'dashboard',
  description: 'Open the system dashboard — overview, agents, daemons, and tasks',
  isEnabled: () => true,
  load: () => import('./dashboard.js'),
};

export default dashboard;
