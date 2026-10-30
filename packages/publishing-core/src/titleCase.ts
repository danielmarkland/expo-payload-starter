/** Title case for authored admin UI titles, never user-authored document names. */
export function titleCase(value: string): string {
  const minor = new Set([
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'by',
    'for',
    'from',
    'in',
    'nor',
    'of',
    'on',
    'or',
    'the',
    'to',
    'with',
  ])
  const words = value.split(/(\s+)/)
  const last = words.reduce(
    (last, word, index) => (/[\p{L}\p{N}]/u.test(word) ? index : last),
    -1,
  )
  return words
    .map((word, index) => {
      if (!/[\p{L}]/u.test(word)) return word
      if (
        index > 0 &&
        index < last &&
        minor.has(word.toLowerCase()) &&
        !/[:—–]$/.test(words[index - 2] || '')
      )
        return word.toLowerCase()
      return word.replace(
        /(^|[-/])([a-z])/g,
        (_, prefix, letter) => prefix + letter.toUpperCase(),
      )
    })
    .join('')
}
