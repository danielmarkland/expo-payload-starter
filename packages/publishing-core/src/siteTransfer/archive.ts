import { createHash } from 'node:crypto'
import {
  siteTransferManifestSchema,
  type SiteTransferManifest,
} from '@danielmarkland/publishing-contracts/siteTransfer'

export const MAX_ARCHIVE_BYTES = 1024 * 1024 * 1024
const MAX_MANIFEST_BYTES = 32 * 1024 * 1024
export type SiteArchive = {
  manifest: SiteTransferManifest
  assets: Map<string, Buffer>
}
export function sha256(data: Uint8Array): string {
  return createHash('sha256').update(data).digest('hex')
}

// A restricted, uncompressed USTAR archive: regular files only, no extraction to disk.
export function encodeSiteArchive(site: SiteArchive): Buffer {
  const manifest = siteTransferManifestSchema.parse(site.manifest)
  const files = new Map<string, Buffer>([
    ['site.json', Buffer.from(JSON.stringify(manifest))],
  ])
  for (const asset of manifest.assets) {
    const data = site.assets.get(asset.path)
    if (!data || data.length !== asset.size || sha256(data) !== asset.sha256)
      throw new Error(`Invalid asset: ${asset.key}`)
    files.set(asset.path, data)
  }
  const chunks: Buffer[] = []
  for (const [path, data] of files) {
    const header = Buffer.alloc(512)
    header.write(path, 0, 100, 'utf8')
    header.write('0000600\0', 100, 8, 'ascii')
    header.write('0000000\0', 108, 8, 'ascii')
    header.write('0000000\0', 116, 8, 'ascii')
    header.write(
      data.length.toString(8).padStart(11, '0') + '\0',
      124,
      12,
      'ascii',
    )
    header.write('00000000000\0', 136, 12, 'ascii')
    header.fill(32, 148, 156)
    header.write('0', 156)
    header.write('ustar\0', 257, 6)
    header.write('00', 263, 2)
    const checksum = header.reduce((sum, byte) => sum + byte, 0)
    header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii')
    chunks.push(header, data, Buffer.alloc((512 - (data.length % 512)) % 512))
  }
  chunks.push(Buffer.alloc(1024))
  const size = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  if (size > MAX_ARCHIVE_BYTES)
    throw new Error('Site archive exceeds 1 GiB limit')
  const result = Buffer.concat(chunks)
  decodeSiteArchive(result)
  return result
}

export function decodeSiteArchive(bytes: Buffer): SiteArchive {
  if (
    bytes.length > MAX_ARCHIVE_BYTES ||
    bytes.length < 1024 ||
    bytes.length % 512
  )
    throw new Error('Invalid archive size')
  const files = new Map<string, Buffer>()
  let offset = 0
  while (offset + 512 <= bytes.length) {
    const header = bytes.subarray(offset, offset + 512)
    offset += 512
    if (header.every((byte) => byte === 0)) {
      if (
        bytes.length - offset < 512 ||
        !bytes.subarray(offset).every((byte) => byte === 0)
      )
        throw new Error('Invalid archive terminator')
      break
    }
    const string = (start: number, length: number) =>
      header
        .subarray(start, start + length)
        .toString('utf8')
        .split('\0')[0]!
    const path = string(0, 100)
    if (path !== 'site.json' && !/^assets\/[a-f0-9]{64}$/.test(path))
      throw new Error(`Unsupported archive path: ${path}`)
    if (
      files.has(path) ||
      string(345, 155) ||
      string(157, 100) ||
      string(257, 6) !== 'ustar' ||
      header[156] !== 48
    )
      throw new Error('Unsupported or duplicate archive entry')
    const octal = (value: string) => {
      if (!/^[0-7]+ *$/.test(value)) throw new Error('Invalid archive header')
      return parseInt(value.trim(), 8)
    }
    const expected = octal(string(148, 8))
    const checksumHeader = Buffer.from(header)
    checksumHeader.fill(32, 148, 156)
    if (checksumHeader.reduce((sum, byte) => sum + byte, 0) !== expected)
      throw new Error('Archive checksum mismatch')
    const size = octal(string(124, 12))
    if (
      !Number.isSafeInteger(size) ||
      size > MAX_ARCHIVE_BYTES ||
      offset + size > bytes.length ||
      (path === 'site.json' && size > MAX_MANIFEST_BYTES)
    )
      throw new Error('Invalid archive entry size')
    files.set(path, bytes.subarray(offset, offset + size))
    offset += Math.ceil(size / 512) * 512
  }
  if (!bytes.subarray(-1024).every((byte) => byte === 0))
    throw new Error('Missing archive terminator')
  const json = files.get('site.json')
  if (!json) throw new Error('Missing site.json')
  const manifest = siteTransferManifestSchema.parse(
    JSON.parse(json.toString('utf8')),
  )
  const assets = new Map<string, Buffer>()
  const keys = new Set<string>()
  for (const asset of manifest.assets) {
    if (keys.has(asset.key))
      throw new Error(`Duplicate asset key: ${asset.key}`)
    keys.add(asset.key)
    const file = files.get(asset.path)
    if (
      !file ||
      file.length !== asset.size ||
      sha256(file) !== asset.sha256 ||
      asset.path !== `assets/${asset.sha256}`
    )
      throw new Error(`Missing or corrupt asset: ${asset.key}`)
    assets.set(asset.path, file)
  }
  if (files.size !== assets.size + 1)
    throw new Error('Unlisted archive entries')
  return { manifest, assets }
}
