import { createRequire } from 'node:module'
const { S3Client, CreateBucketCommand, HeadBucketCommand } = createRequire(
  new URL('../../apps/site/package.json', import.meta.url),
)('@aws-sdk/client-s3')
const endpoint = process.env.AWS_ENDPOINT_URL_S3
if (
  !endpoint ||
  !['localhost', '127.0.0.1'].includes(new URL(endpoint).hostname)
)
  throw Error('Local S3 endpoint required')
const client = new S3Client({
  endpoint,
  region: process.env.AWS_REGION,
  forcePathStyle: true,
})
for (const Bucket of ['cms-media', 'app-uploads', 'site-transfer-archives']) {
  try {
    await client.send(new HeadBucketCommand({ Bucket }))
  } catch (error) {
    if (error.$metadata?.httpStatusCode !== 404) throw error
    await client.send(new CreateBucketCommand({ Bucket }))
  }
}
console.log('Local buckets ready')
