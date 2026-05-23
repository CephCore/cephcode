/**
 * /recap command - On-demand session recap.
 * Generates a short "where we left off" summary of the current session,
 * the same summary that the automatic away-summary produces after 5 minutes.
 * Implementation is lazy-loaded from recap.ts to reduce startup time.
 */
import type { Command } from '../../types/command.js';

const recap = {
  type: 'local',
  name: 'recap',
  description: 'Generate a short summary of what happened in this session',
  aliases: [],
  supportsNonInteractive: false,
  load: () => import('./recap.js'),
} satisfies Command;

export default recap;
