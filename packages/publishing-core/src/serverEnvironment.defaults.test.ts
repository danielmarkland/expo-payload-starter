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

it('uses the database URL port and rejects invalid connection URLs', () => {
  expect(
    getDatabasePoolConfig({ DATABASE_URL: 'postgresql://localhost:6432/db' })
      .connectionString,
  ).toBe('postgresql://localhost:6432/db')
  for (const databaseURL of ['invalid-private-value', 'https://localhost/db'])
    expect(() => getDatabasePoolConfig({ DATABASE_URL: databaseURL })).toThrow(
      'DATABASE_URL must be a valid PostgreSQL URL.',
    )
  expect(
    getDatabasePoolConfig({
      DATABASE_URL: 'postgresql://localhost/db?sslmode=verify-full',
      DATABASE_SSL_CA_CERT: 'ca',
    }),
  ).toMatchObject({
    connectionString: 'postgresql://localhost/db',
    ssl: { ca: 'ca', rejectUnauthorized: true },
  })
})
