export class ServiceUnavailableError extends Error {}
export class UpstreamError extends Error {}
export class UnauthorizedError extends Error {
  constructor() {
    super('Authentication is required.')
  }
}
export class ValidationError extends Error {}

export class NotFoundError extends Error {}
export class ConflictError extends Error {}
export class ForbiddenError extends Error {
  constructor(message = 'Administrator access is required.') {
    super(message)
  }
}
