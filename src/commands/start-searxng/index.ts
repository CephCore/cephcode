import type { Command } from '../../commands.js'

const startSearxng = {
  aliases: [],
  type: 'local-jsx',
  name: 'start-searxng',
  description: 'Start SearXNG search service in Docker',
  load: () => import('./start-searxng.js'),
} satisfies Command

export default startSearxng
