import { randomBytes } from 'node:crypto'
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  chmodSync,
} from 'node:fs'
import { join } from 'node:path'
import { parseEnv } from 'node:util'
import { createServer } from 'node:net'

export const buckets = ['cms-media', 'app-uploads', 'site-transfer-archives']
export const secret = () => randomBytes(36).toString('base64url')
export function choices({ mode, name, email }) {
  if (!['local', 'hosted'].includes(mode)) throw Error('Choose local or hosted')
  if (!/^[a-z][a-z0-9-]{1,47}$/.test(name))
    throw Error(
      'Project name must be 2–48 lowercase letters, digits or hyphens',
    )
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Error('Administrator email required')
  return { mode, name, email: email.toLowerCase() }
}
export function origin(value, local = false) {
  const url = new URL(value)
  if (
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    (local
      ? url.protocol !== 'http:' ||
        !['localhost', '127.0.0.1'].includes(url.hostname)
      : url.protocol !== 'https:')
  )
    throw Error(
      local
        ? 'Local localhost HTTP origin required'
        : 'Hosted HTTPS origin required',
    )
  return url.origin
}
export function privateWrite(path, content) {
  mkdirSync(join(path, '..'), { recursive: true, mode: 0o700 })
  const temporary = `${path}.${process.pid}.tmp`
  writeFileSync(temporary, content, { mode: 0o600, flag: 'wx' })
  renameSync(temporary, path)
  chmodSync(path, 0o600)
}
export function envText(values) {
  return (
    Object.entries(values)
      .map(([key, value]) => {
        if (!/^[A-Z][A-Z0-9_]*$/.test(key) || /[\r\n\0"\\]/.test(String(value)))
          throw Error('Invalid generated configuration')
        return `${key}="${value}"`
      })
      .join('\n') + '\n'
  )
}
export function writeManagedEnv(root, state, relative, values) {
  const path = join(root, relative)
  const existing = existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {}
  const previous = state.files?.[relative] || {}
  for (const [key, value] of Object.entries(values)) {
    if (
      existing[key] !== undefined &&
      existing[key] !== String(value) &&
      existing[key] !== previous[key]
    )
      throw Error(
        `Existing ${relative}: ${key} differs; no configuration was overwritten`,
      )
  }
  privateWrite(path, envText({ ...existing, ...values }))
  state.files ||= {}
  state.files[relative] = values
}
export async function freePort(preferred) {
  const probe = (port) =>
    new Promise((resolve, reject) => {
      const server = createServer()
      server.once('error', reject)
      server.listen(port, '127.0.0.1', () => {
        const selected = server.address().port
        server.close(() => resolve(selected))
      })
    })
  try {
    return await probe(preferred)
  } catch (error) {
    if (error.code !== 'EADDRINUSE') throw error
    return probe(0)
  }
}
export function runtimeSettings(state, scheme) {
  if (!/^[a-z][a-z0-9+.-]*$/.test(scheme))
    throw Error('Invalid native application scheme')
  const siteURL = origin(state.siteURL, state.mode === 'local')
  return {
    DATABASE_URL: state.database,
    PAYLOAD_SECRET: state.payloadSecret,
    AUTH_SECRET: state.authSecret,
    SITE_URL: siteURL,
    AUTH_TRUSTED_ORIGINS: [
      siteURL,
      `${scheme}://`,
      ...(state.mode === 'local'
        ? [`http://localhost:${state.ports.app}`]
        : state.environment === 'development'
          ? ['http://localhost:8081']
          : []),
    ].join(','),
    AWS_ACCESS_KEY_ID: state.storage.accessKey,
    AWS_SECRET_ACCESS_KEY: state.storage.secretKey,
    AWS_ENDPOINT_URL_S3: state.storage.endpoint,
    AWS_REGION: state.storage.region,
  }
}
