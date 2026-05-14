import { describe, expect, test } from 'bun:test'
import { decodeHtmlEntities } from './htmlEntities.js'

describe('decodeHtmlEntities', () => {
  test('decodes common named and numeric entities', () => {
    expect(
      decodeHtmlEntities('&quot;ทำ&#39; &amp; &#x0E17;&#x0E33;'),
    ).toBe('"ทำ\' & ทำ')
  })

  test('leaves unknown or invalid entities alone', () => {
    expect(decodeHtmlEntities('&custom; &#999999999;')).toBe(
      '&custom; &#999999999;',
    )
  })
})
