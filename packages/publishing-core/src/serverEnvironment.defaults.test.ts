import { it, expect } from 'vitest'
import { getDatabasePoolConfig } from './serverEnvironment'
it('uses bounded pool defaults while preserving CA verification and overrides', () => {
  expect(
    getDatabasePoolConfig({ DATABASE_URL: 'postgresql://localhost/db' }),
  ).toMatchObject({
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  })
  expect(
    getDatabasePoolConfig({
      DATABASE_URL: 'postgresql://localhost/db',
      DATABASE_POOL_MAX: '4',
      DATABASE_SSL_CA_CERT: 'ca',
    }),
  ).toMatchObject({ max: 4, ssl: { ca: 'ca', rejectUnauthorized: true } })
})
