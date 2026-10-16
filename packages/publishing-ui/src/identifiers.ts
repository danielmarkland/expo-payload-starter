/** Display only. Keep the complete value for identity, links, SDK calls and queries. */
export function abbreviateIdentifier(value: string): string {
  return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value
}
