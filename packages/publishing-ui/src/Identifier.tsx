import { abbreviateIdentifier } from './identifiers.js'

/** The full identifier remains available on hover and to assistive technology. */
export function Identifier({ value }: { value: string }) {
  return (
    <code title={value} aria-label={value}>
      {abbreviateIdentifier(value)}
    </code>
  )
}
