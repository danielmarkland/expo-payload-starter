import { randomBytes } from 'node:crypto'

export const sensitiveVariableNames = new Set([
  'CONTACT_TO_ADDRESS',
  'DATABASE_URL',
  'PAYLOAD_SECRET',
  'PREVIEW_SECRET',
  'RESEND_API_KEY',
  'SUPABASE_S3_ACCESS_KEY_ID',
  'SUPABASE_S3_SECRET_ACCESS_KEY',
  'TURNSTILE_SECRET_KEY',
])

export function canonicalURL(value) {
  const url = new URL(value)
  url.hash = ''
  url.search = ''
  return url.toString().replace(/\/$/, '')
}

export function databaseURL(poolerURL, password) {
  const url = new URL(poolerURL)
  url.password = password
  return url.toString()
}

export function generatedSecret() {
  return randomBytes(48).toString('base64url')
}

export function getPublishableKey(keys) {
  const key = keys.find((candidate) => candidate.type === 'publishable')
  if (!key?.api_key)
    throw new Error('The Supabase project has no publishable API key.')
  return key.api_key
}

export function getEnvironmentNames(value) {
  const entries = Array.isArray(value)
    ? value
    : Array.isArray(value?.envs)
      ? value.envs
      : Array.isArray(value?.environmentVariables)
        ? value.environmentVariables
        : []
  return new Set(
    entries.map((entry) => entry.key || entry.name).filter(Boolean),
  )
}

export function redact(value) {
  if (typeof value !== 'string') return value
  return value
    .replace(
      /postgres(?:ql)?:\/\/([^:@/]+):([^@/]+)@/gi,
      'postgresql://$1:[REDACTED]@',
    )
    .replace(/\b(?:sb_secret|sb_publishable)_[A-Za-z0-9_-]+\b/g, (match) => {
      const [prefix] = match.split('_', 2)
      return `${prefix}_[REDACTED]`
    })
}

export function siteVariables({
  appURL,
  database,
  optional = {},
  payloadSecret,
  previewSecret,
  s3,
  siteURL,
}) {
  return {
    DATABASE_URL: database,
    PAYLOAD_SECRET: payloadSecret,
    PREVIEW_SECRET: previewSecret,
    NEXT_PUBLIC_APP_URL: appURL,
    NEXT_PUBLIC_SITE_URL: siteURL,
    SUPABASE_S3_ACCESS_KEY_ID: s3.accessKeyID,
    SUPABASE_S3_BUCKET: s3.bucket,
    SUPABASE_S3_ENDPOINT: s3.endpoint,
    SUPABASE_S3_REGION: s3.region,
    SUPABASE_S3_SECRET_ACCESS_KEY: s3.secretAccessKey,
    ...Object.fromEntries(
      Object.entries(optional).filter(([, value]) => Boolean(value)),
    ),
  }
}

export function appVariables({
  publishableKey,
  siteURL,
  supabaseURL,
  gtmContainerID,
}) {
  return {
    EXPO_PUBLIC_SITE_URL: siteURL,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    EXPO_PUBLIC_SUPABASE_URL: supabaseURL,
    ...(gtmContainerID ? { EXPO_PUBLIC_GTM_CONTAINER_ID: gtmContainerID } : {}),
  }
}

export function productionConfig(
  localConfig,
  { appURL, google, nativeScheme, projectRef },
) {
  let config = localConfig
    .replace(
      /^project_id\s*=.*$/m,
      `project_id = ${JSON.stringify(projectRef)}`,
    )
    .replace(/^site_url\s*=.*$/m, `site_url = ${JSON.stringify(appURL)}`)
    .replace(
      /^additional_redirect_urls\s*=\s*\[[\s\S]*?^\]/m,
      `additional_redirect_urls = [\n  ${JSON.stringify(`${appURL}/auth/callback`)},\n  ${JSON.stringify(`${nativeScheme}://auth/callback`)}\n]`,
    )

  config = config.replace(/\n\[auth\.external\.google\][\s\S]*?(?=\n\[|$)/, '')
  if (google) {
    config += `\n\n[auth.external.google]\nenabled = true\nclient_id = ${JSON.stringify(google.clientID)}\nsecret = ${JSON.stringify(google.secret)}\n`
  }
  return config
}

export function redactedVariableSummary(variables) {
  return Object.fromEntries(
    Object.entries(variables).map(([name, value]) => [
      name,
      sensitiveVariableNames.has(name) ? '[sensitive]' : redact(value),
    ]),
  )
}
