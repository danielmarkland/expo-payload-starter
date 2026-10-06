import type { ApiError } from '@danielmarkland/publishing-contracts'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ServiceUnavailableError,
  UpstreamError,
} from './serviceErrors.js'

const serviceErrorResponses = [
  [UnauthorizedError, 401, 'unauthorized'],
  [ForbiddenError, 403, 'forbidden'],
  [NotFoundError, 404, 'not_found'],
  [ConflictError, 409, 'conflict'],
  [ValidationError, 400, 'validation_error'],
  [ServiceUnavailableError, 503, 'unavailable'],
  [UpstreamError, 502, 'upstream_error'],
] as const

/** Shared HTTP policy; hosts own routes, authentication, tenancy and logging. */
export function publishingErrorResponse(error: unknown): {
  status: 400 | 401 | 403 | 404 | 409 | 500 | 502 | 503
  body: ApiError
  unexpected: boolean
} {
  const known = serviceErrorResponses.find(([type]) => error instanceof type)
  if (known && error instanceof Error)
    return {
      status: known[1],
      body: { error: { code: known[2], message: error.message } },
      unexpected: false,
    }
  return {
    status: 500,
    body: {
      error: {
        code: 'internal_error',
        message: 'The request could not be completed.',
      },
    },
    unexpected: true,
  }
}
export const publishingNotFoundResponse: ApiError = {
  error: { code: 'not_found', message: 'Resource not found.' },
}
export const publishingValidationResponse: ApiError = {
  error: { code: 'validation_error', message: 'Invalid request.' },
}
export function validPreviewSecret(
  value: string | undefined,
  getSecret: () => string,
) {
  if (!value) return false
  try {
    const expected = getSecret()
    return Boolean(expected) && value === expected
  } catch {
    return false
  }
}
export function publishingCacheControl(
  request: Request,
  status: number,
  isPrivatePath: (path: string) => boolean = () => false,
): string | undefined {
  const path = new URL(request.url).pathname
  if (
    status >= 400 ||
    request.method !== 'GET' ||
    request.headers.has('authorization') ||
    request.headers.has('x-preview-secret') ||
    /\/me(?:\/|$)/.test(path) ||
    isPrivatePath(path)
  )
    return 'no-store'
  if (path.endsWith('/docs') || path.endsWith('/openapi.json')) return undefined
  return 'public, max-age=60, stale-while-revalidate=300'
}
