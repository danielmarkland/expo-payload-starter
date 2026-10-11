import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
const require = createRequire(
  new URL('../../apps/site/package.json', import.meta.url),
)
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const endpoint = process.env.AWS_ENDPOINT_URL_S3
if (
  !endpoint ||
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY
)
  throw Error('Complete S3 environment required')
const client = new S3Client({
  endpoint,
  region: process.env.AWS_REGION,
  forcePathStyle: true,
})
for (const Bucket of ['cms-media', 'app-uploads', 'site-transfer-archives']) {
  const Key = `release-verification/${randomUUID()}`,
    Body = randomUUID()
  try {
    await client.send(
      new PutObjectCommand({ Bucket, Key, Body, ContentType: 'text/plain' }),
    )
    const signed = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket, Key }),
      { expiresIn: 60 },
    )
    const accepted = await fetch(signed, { signal: AbortSignal.timeout(15000) })
    if (!accepted.ok || (await accepted.text()) !== Body)
      throw Error('Signed storage round trip failed')
    const anonymous = await fetch(`${endpoint}/${Bucket}/${Key}`, {
      signal: AbortSignal.timeout(15000),
    })
    if (![401, 403].includes(anonymous.status))
      throw Error('Bucket permits anonymous reads')
    console.log(`${Bucket}: write, signed read and anonymous denial verified`)
  } finally {
    await client.send(new DeleteObjectCommand({ Bucket, Key }))
  }
}
