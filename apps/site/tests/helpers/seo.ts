import type { Payload } from 'payload'

/** Real upload relationships for disposable editorial test records only. */
export async function createSEOMetadata(payload: Payload, title: string) {
  const data = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
    'base64',
  )
  const media = await payload.create({
    collection: 'media',
    data: { alt: `${title} test image` },
    file: {
      data,
      mimetype: 'image/png',
      name: `seo-${crypto.randomUUID()}.png`,
      size: data.length,
    },
    overrideAccess: true,
  })
  return { title, description: `Editorial acceptance fixture for ${title}.`, image: media.id }
}
