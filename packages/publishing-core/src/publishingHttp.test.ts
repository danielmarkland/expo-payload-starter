import { describe, it, expect } from 'vitest'
import { apiErrorSchema } from '@danielmarkland/publishing-contracts'
import {
  publishingErrorResponse,
  publishingCacheControl,
  validPreviewSecret,
} from './publishingHttp.js'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  UpstreamError,
  ValidationError,
  ServiceUnavailableError,
} from './serviceErrors.js'
describe('shared publishing HTTP policy', () => {
  it.each([
    [new UnauthorizedError(), 401],
    [new ForbiddenError(), 403],
    [new NotFoundError('missing'), 404],
    [new ConflictError('busy'), 409],
    [new ValidationError('invalid'), 400],
    [new UpstreamError('provider'), 502],
    [new ServiceUnavailableError('disabled'), 503],
  ] as const)('formats known errors as portable contracts', (error, status) => {
    const response = publishingErrorResponse(error)
    expect(response.status).toBe(status)
    expect(response.unexpected).toBe(false)
    expect(apiErrorSchema.parse(response.body)).toEqual(response.body)
    expect(response.body.error.message).toBe(error.message)
  })
  it('conceals unexpected errors', () => {
    const response = publishingErrorResponse(
      new Error('private database details'),
    )
    expect(response.status).toBe(500)
    expect(response.unexpected).toBe(true)
    expect(JSON.stringify(response.body)).not.toContain('private')
  })
  it.each([
    [
      '/posts',
      200,
      {},
      'GET',
      'public, max-age=60, stale-while-revalidate=300',
    ],
    ['/posts', 404, {}, 'GET', 'no-store'],
    ['/posts', 503, {}, 'GET', 'no-store'],
    ['/posts', 200, { 'x-preview-secret': '' }, 'GET', 'no-store'],
    ['/posts', 200, { authorization: 'Bearer token' }, 'GET', 'no-store'],
    ['/me/profile', 200, {}, 'GET', 'no-store'],
    ['/contact', 200, {}, 'POST', 'no-store'],
    ['/site-transfers/id', 200, {}, 'GET', 'no-store'],
    ['/docs', 200, {}, 'GET', undefined],
  ] as const)(
    'does not publicly cache private or unsuccessful responses',
    (path, status, headers, method, expected) => {
      expect(
        publishingCacheControl(
          new Request('https://site.example' + path, { headers, method }),
          status,
          (path) => path.startsWith('/site-transfers'),
        ),
      ).toBe(expected)
    },
  )
  it('fails closed for preview secrets', () => {
    expect(validPreviewSecret('secret', () => 'secret')).toBe(true)
    expect(validPreviewSecret(undefined, () => 'secret')).toBe(false)
    expect(validPreviewSecret('', () => '')).toBe(false)
    expect(validPreviewSecret('wrong', () => 'secret')).toBe(false)
    expect(
      validPreviewSecret('secret', () => {
        throw new Error('misconfigured')
      }),
    ).toBe(false)
  })
})
