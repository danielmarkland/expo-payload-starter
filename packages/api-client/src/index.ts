import { profileSchema } from '@danielmarkland/contracts'
import {
  apiOkSchema,
  navigationSchema,
  pageSchema,
  paginatedPostsSchema,
  postSchema,
  siteMetadataSchema,
  siteConfigSchema,
  type ContactSubmission,
  type NewsletterSubmission,
} from '@danielmarkland/publishing-contracts'
import type { z } from 'zod'

export interface ApiClientOptions {
  baseUrl: string
  fetch?: typeof globalThis.fetch
  getAccessToken?: () => Promise<null | string>
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = 'request_failed',
  ) {
    super(message)
  }
}

export function createApiClient(options: ApiClientOptions) {
  const request = async <Schema extends z.ZodType>(
    path: string,
    schema: Schema,
    init?: RequestInit,
  ): Promise<z.infer<Schema>> => {
    const token = await options.getAccessToken?.()
    const headers = new Headers(init?.headers)
    if (init?.body) headers.set('content-type', 'application/json')
    if (token) headers.set('authorization', `Bearer ${token}`)
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl}${path}`,
      {
        ...init,
        headers,
      },
    )
    const body = (await response.json()) as unknown
    if (!response.ok) {
      const error = body as { error?: { code?: string; message?: string } }
      throw new ApiClientError(
        error.error?.message ?? `API request failed with ${response.status}.`,
        response.status,
        error.error?.code,
      )
    }
    return schema.parse(body)
  }

  return {
    contact: (body: ContactSubmission) =>
      request('/contact', apiOkSchema, {
        body: JSON.stringify(body),
        method: 'POST',
      }),
    getNavigation: () => request('/navigation', navigationSchema),
    getPage: (slug: string) =>
      request(`/pages/${encodeURIComponent(slug)}`, pageSchema),
    getPost: (slug: string) =>
      request(`/posts/${encodeURIComponent(slug)}`, postSchema),
    getPosts: (query = '') => request(`/posts${query}`, paginatedPostsSchema),
    getProfile: () => request('/me/profile', profileSchema),
    getSiteConfig: () => request('/site-config', siteConfigSchema),
    getSiteMetadata: () => request('/site-metadata', siteMetadataSchema),
    newsletter: (body: NewsletterSubmission) =>
      request('/newsletter', apiOkSchema, {
        body: JSON.stringify(body),
        method: 'POST',
      }),
    updateProfile: (displayName: null | string) =>
      request('/me/profile', profileSchema, {
        body: JSON.stringify({ displayName }),
        method: 'PATCH',
      }),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
