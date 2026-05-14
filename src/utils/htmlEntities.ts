const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  middot: '·',
  bull: '•',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  trade: '™',
  reg: '®',
  copy: '©',
}

const HTML_ENTITY_RE = /&(?:#(\d+)|#x([\da-fA-F]+)|([a-zA-Z][\w-]*));?/g

export function decodeHtmlEntities(text: string): string {
  if (typeof text !== 'string' || !text.includes('&')) return text

  return text.replace(HTML_ENTITY_RE, (match, decimal, hex, named) => {
    if (decimal) {
      const codePoint = Number.parseInt(decimal, 10)
      return Number.isFinite(codePoint)
        ? codePointToString(codePoint, match)
        : match
    }
    if (hex) {
      const codePoint = Number.parseInt(hex, 16)
      return Number.isFinite(codePoint)
        ? codePointToString(codePoint, match)
        : match
    }
    const entityName = named.toLowerCase()
    return NAMED_ENTITIES[entityName] ?? match
  })
}

function codePointToString(codePoint: number, fallback: string): string {
  try {
    return String.fromCodePoint(codePoint)
  } catch {
    return fallback
  }
}
