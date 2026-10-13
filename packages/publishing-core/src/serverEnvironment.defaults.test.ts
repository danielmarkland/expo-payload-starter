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

it('preserves transitional ports but rejects conflicting explicit configuration', () => {
  for (const databaseURL of [
    'postgresql://localhost/db',
    'postgresql://localhost:6432/db',
  ])
    expect(
      getDatabasePoolConfig({
        DATABASE_URL: databaseURL,
        DATABASE_POOLER_PORT: '6432',
      }).connectionString,
    ).toBe('postgresql://localhost:6432/db')
  expect(() =>
    getDatabasePoolConfig({
      DATABASE_URL: 'postgresql://user:private@localhost:5432/db',
      DATABASE_POOLER_PORT: '6432',
    }),
  ).toThrow('DATABASE_POOLER_PORT conflicts with the port in DATABASE_URL.')
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
