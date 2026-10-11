import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  siteVariables,
  appVariables,
  canonicalURL,
  redactedVariableSummary,
} from './setup-production-lib.mjs'
test('explicit origins reject credentials, paths and insecure hosted URLs', () => {
  assert.equal(canonicalURL('https://example.test/'), 'https://example.test')
  for (const url of [
    'http://example.test',
    'https://secret:password@example.test',
    'https://example.test/path',
  ])
    assert.throws(() => canonicalURL(url))
})
test('native clients receive only the public backend origin', () =>
  assert.deepEqual(appVariables({ siteURL: 'https://example.test' }), {
    EXPO_PUBLIC_SITE_URL: 'https://example.test',
  }))
test('pooled server credentials and native identity secrets remain redacted', () => {
  const config = siteVariables({
    database: 'postgresql://user:secret@host-pooler.neon.tech/db',
    payloadSecret: 'secret',
    authSecret: 'identity-secret',
    siteURL: 'https://example.test',
    origins: 'starter://',
    s3: {
      accessKeyID: 'access',
      secretAccessKey: 'secret',
      endpoint: 'https://storage.example.test',
      region: 'us-east-1',
    },
  })
  const safe = redactedVariableSummary(config)
  assert.equal(safe.DATABASE_URL, '[sensitive]')
  assert.equal(safe.AUTH_SECRET, '[sensitive]')
  assert.equal(safe.AWS_SECRET_ACCESS_KEY, '[sensitive]')
  assert.equal(safe.SITE_URL, 'https://example.test')
})
