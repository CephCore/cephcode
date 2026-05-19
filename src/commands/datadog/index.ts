import type { Command } from '../../commands.js';

const datadogCommand = {
  type: 'local-jsx',
  name: 'datadog',
  description: 'Manage individual telemetry and analytics settings (Datadog, Anthropic, Global)',
  load: () => import('./datadog.js'),
} satisfies Command;

export default datadogCommand;
