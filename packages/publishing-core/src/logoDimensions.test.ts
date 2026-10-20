import { describe, expect, it } from 'vitest'
import { resolvePublishingSiteConfig } from './siteConfig.js'
import { siteConfigSchema } from '@danielmarkland/publishing-contracts'

const identity = {
  appTitle: 'Example',
  siteTitle: 'Example',
  shortName: 'Example',
  siteDescription: 'Example publication',
}
describe('logo bounds', () => {
  it('resolves defaults and site overrides into the public config', () => {
    expect(
      resolvePublishingSiteConfig(identity, 'https://example.com').identity,
    ).toMatchObject({ logoMaxWidth: 240, logoMaxHeight: 56 })
    const config = resolvePublishingSiteConfig(
      { ...identity, logoMaxWidth: 320, logoMaxHeight: 64 },
      'https://example.com',
    )
    expect(siteConfigSchema.parse(config).identity).toMatchObject({
      logoMaxWidth: 320,
      logoMaxHeight: 64,
    })
    expect(
      siteConfigSchema.safeParse({
        ...config,
        identity: { ...config.identity, logoMaxWidth: -1 },
      }).success,
    ).toBe(false)
  })
})
