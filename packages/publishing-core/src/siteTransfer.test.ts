import { describe, expect, it } from 'vitest'
import { encodeSiteArchive, decodeSiteArchive, sha256 } from './siteTransfer.js'
import { projectState } from './siteTransfer/fields.js'
import type { SiteTransferManifest } from '@danielmarkland/publishing-contracts/siteTransfer'
const bytes = Buffer.from('original media')
const hash = sha256(bytes)
const manifest: SiteTransferManifest = {
  format: 'publishing-site',
  version: 1,
  createdAt: '2026-10-05T00:00:00.000Z',
  extensions: {},
  resources: ['media'],
  records: [
    {
      key: 'm',
      resource: 'media',
      draft: false,
      asset: 'm',
      current: { data: { alt: 'Logo' }, references: [] },
    },
  ],
  assets: [
    {
      key: 'm',
      path: `assets/${hash}`,
      sha256: hash,
      size: bytes.length,
      filename: 'logo.png',
      mimeType: 'image/png',
    },
  ],
}
const encode = () =>
  encodeSiteArchive({ manifest, assets: new Map([[`assets/${hash}`, bytes]]) })
describe('portable site archive', () => {
  it('round trips originals and metadata', () => {
    const result = decodeSiteArchive(encode())
    expect(result.manifest).toEqual(manifest)
    expect(result.assets.get(`assets/${hash}`)).toEqual(bytes)
  })
  it('rejects corrupt media, versions, truncated archives and traversal paths', () => {
    const corrupt = encode()
    corrupt[1024 + 512] ^= 1
    expect(() => decodeSiteArchive(corrupt)).toThrow()
    expect(() => decodeSiteArchive(encode().subarray(0, -512))).toThrow()
    const unsafe = encode()
    unsafe.write('../secret', 0)
    expect(() => decodeSiteArchive(unsafe)).toThrow('path')
    expect(() =>
      encodeSiteArchive({
        manifest: {
          ...manifest,
          version: 2,
        } as unknown as SiteTransferManifest,
        assets: new Map(),
      }),
    ).toThrow()
  })
  it('projects only declared fields and remaps nested relationships', () => {
    const state = projectState(
      {
        title: 'Page',
        internalOwner: 'private',
        password: 'secret',
        rows: [{ id: 'row', image: 12 }],
      },
      [
        { name: 'title', type: 'text' },
        {
          name: 'rows',
          type: 'array',
          fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
        },
      ],
      (slug, id) => `${slug}:${id}`,
    )
    expect(state).toEqual({
      data: { title: 'Page', rows: [{ image: null }] },
      references: [{ path: ['rows', 0, 'image'], target: 'media:12' }],
    })
  })
  it('rejects unknown blocks, dangling references and prototype properties', () => {
    expect(() =>
      projectState(
        { layout: [{ blockType: 'missing' }] },
        [{ name: 'layout', type: 'blocks', blocks: [] }],
        () => '',
      ),
    ).toThrow('Unsupported block')
    expect(() =>
      projectState(JSON.parse('{"__proto__":{}}'), [], () => ''),
    ).toThrow('Unsafe')
  })
})
