import { randomBytes } from 'node:crypto'
export const sensitiveVariableNames = new Set([
  'DATABASE_URL',
  'DATABASE_MIGRATION_URL',
  'PAYLOAD_SECRET',
  'AUTH_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'RESEND_API_KEY',
  'MAILERLITE_API_KEY',
  'TURNSTILE_SECRET_KEY',
  'CONTACT_TO_ADDRESS',
])
export function canonicalURL(value) {
  const url = new URL(value)
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw Error('Credential-free HTTPS origin required')
  return url.origin
}
export function generatedSecret() {
  return randomBytes(48).toString('base64url')
}
export function getEnvironmentNames(value) {
  return new Set(
    (Array.isArray(value) ? value : value.envs || []).map(
      (entry) => entry.key || entry.name,
    ),
  )
}
export function siteVariables({
  database,
  payloadSecret,
  authSecret,
  s3,
  siteURL,
  origins,
}) {
  if (new URL(database).hostname.includes('-pooler') === false)
    throw Error('Runtime requires pooled Neon connection')
  return {
    DATABASE_URL: database,
    PAYLOAD_SECRET: payloadSecret,
    AUTH_SECRET: authSecret,
    SITE_URL: canonicalURL(siteURL),
    AUTH_TRUSTED_ORIGINS: origins,
    AWS_ACCESS_KEY_ID: s3.accessKeyID,
    AWS_SECRET_ACCESS_KEY: s3.secretAccessKey,
    AWS_ENDPOINT_URL_S3: s3.endpoint,
    AWS_REGION: s3.region,
  }
}
export function appVariables({ siteURL }) {
  return { EXPO_PUBLIC_SITE_URL: canonicalURL(siteURL) }
}
export function redactedVariableSummary(variables) {
  return Object.fromEntries(
    Object.entries(variables).map(([name, value]) => [
      name,
      sensitiveVariableNames.has(name) ? '[sensitive]' : value,
    ]),
  )
}
