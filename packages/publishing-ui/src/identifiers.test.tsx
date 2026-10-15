import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { abbreviateIdentifier } from './identifiers.js'
import { Identifier } from './Identifier.js'

describe('identifier presentation', () => {
  it('abbreviates UUIDs without changing the original identifier', () => {
    const id = '26f5d41a-b90e-4719-a2c3-4e6ba90625d6'
    expect(abbreviateIdentifier(id)).toBe('26f5d41a…25d6')
    expect(id).toBe('26f5d41a-b90e-4719-a2c3-4e6ba90625d6')
    expect(renderToStaticMarkup(createElement(Identifier, { value: id }))).toBe(
      `<code title="${id}" aria-label="${id}">26f5d41a…25d6</code>`,
    )
  })
  it('leaves short references and empty values readable', () => {
    expect(abbreviateIdentifier('WBUR-12345')).toBe('WBUR-12345')
    expect(abbreviateIdentifier('')).toBe('')
    expect(abbreviateIdentifier('1234567890123456')).toBe('1234567890123456')
  })
})
