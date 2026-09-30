import { siteConfigSchema, siteMetadataSchema } from '@danielmarkland/contracts'
import { internalApiRequest } from '@/lib/api/internal'

export async function getSitePresentation() {
  const [configResponse, metadataResponse] = await Promise.all([
    internalApiRequest('/site-config'),
    internalApiRequest('/site-metadata'),
  ])
  if (!configResponse.ok || !metadataResponse.ok) {
    throw new Error('Site presentation API request failed.')
  }
  return {
    config: siteConfigSchema.parse(await configResponse.json()),
    metadata: siteMetadataSchema.parse(await metadataResponse.json()),
  }
}
