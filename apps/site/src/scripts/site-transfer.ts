import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getPayload, type PayloadRequest } from 'payload'
import {
  exportSite,
  previewSiteReplacement,
  replaceSite,
  publishingTransferResources,
  payloadSiteWriteLock,
  type TransferPreview,
} from '@danielmarkland/publishing-core/siteTransfer'
import config from '../payload.config'
import { getStorageConfig, getSiteURL } from '../lib/serverConfig'

const [command, ...args] = process.argv.slice(2)
function flag(name: string) {
  const index = args.indexOf(`--${name}`)
  return index < 0 ? undefined : args[index + 1]
}
function required(name: string) {
  const value = flag(name)
  if (!value) throw new Error(`--${name} is required`)
  return value
}
const destination = process.env.SITE_TRANSFER_DESTINATION_LABEL
const backupFolder = process.env.SITE_TRANSFER_BACKUP_DIR
if (!destination || !backupFolder)
  throw new Error('SITE_TRANSFER_DESTINATION_LABEL and SITE_TRANSFER_BACKUP_DIR are required')
const payload = await getPayload({ config })
try {
  const req: Partial<PayloadRequest> = {}
  const storage = getStorageConfig()
  const s3 = storage.accessKeyId
    ? new S3Client({
        endpoint: storage.endpoint,
        region: storage.region,
        forcePathStyle: true,
        credentials: { accessKeyId: storage.accessKeyId, secretAccessKey: storage.secretAccessKey },
      })
    : null
  const options = {
    payload,
    req,
    resources: publishingTransferResources(payload),
    sourceOrigin: getSiteURL(),
    withWriteLock: payloadSiteWriteLock(payload, 'site', req),
    readMedia: async (doc: Record<string, unknown>) => {
      const filename = String(doc.filename)
      if (basename(filename) !== filename || filename.includes('\\'))
        throw new Error('Invalid stored media filename')
      if (s3) {
        const result = await s3.send(
          new GetObjectCommand({ Bucket: storage.bucket, Key: filename }),
        )
        if (!result.Body) throw new Error('Original media is missing')
        return Buffer.from(await result.Body.transformToByteArray())
      }
      const upload = payload.collections.media!.config.upload
      if (!upload) throw new Error('Media uploads are not configured')
      return readFile(join(upload.staticDir || resolve('media'), filename))
    },
    saveBackup: async (bytes: Buffer) => {
      await mkdir(backupFolder, { recursive: true, mode: 0o700 })
      const path = join(backupFolder, `${Date.now()}-${randomUUID()}.tar`)
      await writeFile(path, bytes, { mode: 0o600, flag: 'wx' })
      const check = await readFile(path)
      if (!check.equals(bytes)) throw new Error('Backup verification failed')
      return path
    },
  }
  if (command === 'export') {
    const archive = await exportSite(options)
    await writeFile(resolve(required('output')), archive, { mode: 0o600, flag: 'wx' })
  } else if (command === 'preview') {
    const preview = await previewSiteReplacement(await readFile(required('file')), options)
    await writeFile(required('output'), JSON.stringify({ destination, preview }), {
      mode: 0o600,
      flag: 'wx',
    })
    console.log(JSON.stringify({ destination, replacement: true, ...preview }, null, 2))
  } else if (command === 'apply') {
    const saved = JSON.parse(await readFile(required('preview'), 'utf8')) as {
      destination: string
      preview: TransferPreview
    }
    if (saved.destination !== destination || required('confirm-destination') !== destination)
      throw new Error('Destination confirmation does not match')
    console.log(await replaceSite(await readFile(required('file')), saved.preview, options))
  } else
    throw new Error(
      'Usage: site-transfer export|preview|apply --output|--file|--preview|--confirm-destination',
    )
} finally {
  await payload.destroy()
}
