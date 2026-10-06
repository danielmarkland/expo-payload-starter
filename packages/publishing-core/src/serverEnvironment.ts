import { createHmac } from 'node:crypto'

type Environment = Record<string, string | undefined>

function normalizedURL(value: string, name: string) {
  try {
    return new URL(value).toString().replace(/\/$/, '')
  } catch {
    throw new Error(`${name} must be a complete URL.`)
  }
}

export function getSiteURL(environment: Environment = process.env) {
  if (environment.SITE_URL)
    return normalizedURL(environment.SITE_URL, 'SITE_URL')
  if (environment.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizedURL(
      `https://${environment.VERCEL_PROJECT_PRODUCTION_URL}`,
      'VERCEL_PROJECT_PRODUCTION_URL',
    )
  }
  throw new Error('SITE_URL or VERCEL_PROJECT_PRODUCTION_URL is required.')
}

export function getPreviewSecret(environment: Environment = process.env) {
  const payloadSecret = environment.PAYLOAD_SECRET
  if (!payloadSecret) throw new Error('PAYLOAD_SECRET is required.')
  return createHmac('sha256', payloadSecret)
    .update('payload-preview-v1')
    .digest('base64url')
}

export function getContactEmailConfig(environment: Environment = process.env) {
  const apiKey = environment.RESEND_API_KEY || null
  const fromAddress = environment.EMAIL_FROM_ADDRESS || null
  const toAddress = environment.CONTACT_TO_ADDRESS || fromAddress
  const turnstileSecret = environment.TURNSTILE_SECRET_KEY || null

  if (apiKey && !fromAddress) {
    throw new Error(
      'EMAIL_FROM_ADDRESS is required when RESEND_API_KEY is configured.',
    )
  }

  return { apiKey, fromAddress, toAddress, turnstileSecret }
}

export function getNewsletterConfig(environment: Environment = process.env) {
  return {
    apiKey: environment.MAILERLITE_API_KEY || null,
    turnstileSecret: environment.TURNSTILE_SECRET_KEY || null,
  }
}

export function getStorageConfig(environment: Environment = process.env) {
  const config = {
    accessKeyId: environment.SUPABASE_S3_ACCESS_KEY_ID || '',
    bucket: 'cms-media',
    endpoint: environment.SUPABASE_S3_ENDPOINT,
    region: environment.SUPABASE_S3_REGION || 'local',
    secretAccessKey: environment.SUPABASE_S3_SECRET_ACCESS_KEY || '',
  }

  if (environment.VERCEL === '1') {
    const missing = [
      ['SUPABASE_S3_ACCESS_KEY_ID', config.accessKeyId],
      ['SUPABASE_S3_SECRET_ACCESS_KEY', config.secretAccessKey],
      ['SUPABASE_S3_ENDPOINT', config.endpoint],
      ['SUPABASE_S3_REGION', environment.SUPABASE_S3_REGION],
    ].filter(([, value]) => !value)

    if (missing.length) {
      throw new Error(
        `Payload media storage is missing required Vercel configuration: ${missing
          .map(([name]) => name)
          .join(', ')}.`,
      )
    }
  }

  return config
}

function positiveIntegerSetting(name: string, environment: Environment) {
  const value = environment[name]
  if (!value) return undefined
  const parsed = Number(value)
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`)
  }
  return parsed
}

export function getDatabasePoolConfig(environment: Environment = process.env) {
  let connectionString = environment.DATABASE_URL || ''
  const ca = environment.DATABASE_SSL_CA_CERT
  const port = positiveIntegerSetting('DATABASE_POOLER_PORT', environment)
  if (port && port > 65535)
    throw new Error('DATABASE_POOLER_PORT must be a valid TCP port.')
  if (ca || port) {
    const url = new URL(connectionString)
    if (port) url.port = String(port)
    // pg's URL SSL parameters replace the SSL object, including its trusted CA.
    if (ca) {
      for (const name of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert'])
        url.searchParams.delete(name)
    }
    connectionString = url.toString()
  }
  return {
    connectionString,
    max: positiveIntegerSetting('DATABASE_POOL_MAX', environment),
    idleTimeoutMillis: positiveIntegerSetting(
      'DATABASE_POOL_IDLE_TIMEOUT_MS',
      environment,
    ),
    connectionTimeoutMillis: positiveIntegerSetting(
      'DATABASE_POOL_CONNECTION_TIMEOUT_MS',
      environment,
    ),
    ...(ca ? { ssl: { ca, rejectUnauthorized: true } } : {}),
  }
}

export function getPayloadStorageOptions(
  storage: ReturnType<typeof getStorageConfig>,
) {
  return {
    enabled: Boolean(storage.accessKeyId && storage.secretAccessKey),
    bucket: storage.bucket,
    collections: { media: true as const },
    config: {
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
      endpoint: storage.endpoint,
      forcePathStyle: true as const,
      region: storage.region,
    },
  }
}
