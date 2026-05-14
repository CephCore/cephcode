import wrapAnsiNpm from 'wrap-ansi'

type WrapAnsiOptions = {
  hard?: boolean
  wordWrap?: boolean
  trim?: boolean
}

const wrapAnsiBun =
  typeof Bun !== 'undefined' && typeof Bun.wrapAnsi === 'function'
    ? Bun.wrapAnsi
    : null

function needsJavaScriptWrap(str: string): boolean {
  for (const char of str) {
    const cp = char.codePointAt(0)!
    if (cp >= 0x0900 && cp <= 0x0eff) return true
  }
  return false
}

const wrapAnsi: (
  input: string,
  columns: number,
  options?: WrapAnsiOptions,
) => string = wrapAnsiBun
  ? (input, columns, options) =>
      needsJavaScriptWrap(input)
        ? wrapAnsiNpm(input, columns, options)
        : wrapAnsiBun(input, columns, options)
  : wrapAnsiNpm

export { wrapAnsi }
