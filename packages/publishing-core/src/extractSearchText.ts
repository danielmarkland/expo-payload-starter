function collectText(value: unknown, output: string[]) {
  if (typeof value === 'string') {
    if (value.trim()) output.push(value)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, output)
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (
      [
        'id',
        'type',
        'version',
        'direction',
        'format',
        'slug',
        'url',
        'mimeType',
      ].includes(key)
    )
      continue
    collectText(child, output)
  }
}

export function extractSearchText(value: unknown): string {
  const output: string[] = []
  collectText(value, output)
  return [...new Set(output.map((part) => part.trim()).filter(Boolean))].join(
    ' ',
  )
}
