import { orderSelectedPosts } from '@danielmarkland/publishing-core/postSelection'
import { createClient } from '@supabase/supabase-js'
import { createProfileRepository, type Database } from '@starter/data'
import { getPayload } from 'payload'

import type { ContactSubmission, NewsletterSubmission } from '@danielmarkland/publishing-contracts'
import { getContactEmailConfig, getNewsletterConfig } from '@/lib/serverConfig'
import { resolveSiteConfig } from '@/lib/siteConfig'
import config from '@/payload.config'

export async function findPage(slug: string, draft = false) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    draft,
    limit: 1,
    overrideAccess: draft,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' as const } }]),
      ],
    },
  })
  return result.docs[0] ?? null
}

export async function findPost(slug: string, draft = false) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' as const } }]),
      ],
    },
  })
  return result.docs[0] ?? null
}

export async function findPosts({
  ids,
  authorId,
  categoryId,
  limit = 12,
  page = 1,
  search,
  tagId,
}: {
  ids?: number[]
  authorId?: number
  categoryId?: number
  limit?: number
  page?: number
  search?: string
  tagId?: number
}) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: ids ? ids.length : limit,
    page: ids ? 1 : page,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      and: [
        ...(ids ? [{ id: { in: ids } }] : []),
        { _status: { equals: 'published' } },
        ...(search
          ? [
              {
                or: [{ title: { contains: search } }, { summary: { contains: search } }],
              },
            ]
          : []),
        ...(authorId ? [{ author: { equals: authorId } }] : []),
        ...(categoryId ? [{ categories: { equals: categoryId } }] : []),
        ...(tagId ? [{ tags: { equals: tagId } }] : []),
      ],
    },
  })
  return ids ? { ...result, docs: orderSelectedPosts(result.docs, ids) } : result
}

export async function searchContent(query: string) {
  const payload = await getPayload({ config })
  const searchResults = await payload.find({
    collection: 'search',
    depth: 0,
    limit: 20,
    overrideAccess: false,
    sort: '-priority',
    where: { or: [{ title: { like: query } }, { searchText: { like: query } }] },
  })
  const results: { href: string; id: number; summary: string; title: string }[] = []
  for (const result of searchResults.docs) {
    const { relationTo, value } = result.doc
    if (typeof value !== 'number') continue
    if (relationTo === 'pages') {
      const page = await payload
        .findByID({ collection: 'pages', id: value, overrideAccess: false })
        .catch(() => null)
      if (page?._status === 'published') {
        results.push({
          href: page.slug === 'home' ? '/' : `/${encodeURIComponent(page.slug)}`,
          id: result.id,
          summary: result.excerpt || '',
          title: page.meta?.title || page.title,
        })
      }
    } else if (relationTo === 'posts') {
      const post = await payload
        .findByID({ collection: 'posts', id: value, overrideAccess: false })
        .catch(() => null)
      if (post?._status === 'published') {
        results.push({
          href: `/posts/${encodeURIComponent(post.slug)}`,
          id: result.id,
          summary: result.excerpt || post.summary,
          title: post.meta?.title || post.title,
        })
      }
    }
  }
  return { results }
}

export async function getSitemapEntries() {
  const payload = await getPayload({ config })
  const [pages, posts] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      where: { _status: { equals: 'published' } },
    }),
  ])
  return {
    entries: [
      ...pages.docs
        .filter((page) => page.slug !== 'home')
        .map((page) => ({ path: `/${encodeURIComponent(page.slug)}`, updatedAt: page.updatedAt })),
      ...posts.docs.map((post) => ({
        path: `/posts/${encodeURIComponent(post.slug)}`,
        updatedAt: post.updatedAt,
      })),
    ],
  }
}

export async function getRedirectDocuments() {
  const payload = await getPayload({ config })
  const redirects = await payload.find({
    collection: 'redirects',
    depth: 1,
    limit: 1000,
    overrideAccess: true,
  })
  return { redirects: redirects.docs }
}

export async function findTaxonomy(collection: 'authors' | 'categories' | 'tags', slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection,
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] ?? null
}

export async function getNavigation() {
  const payload = await getPayload({ config })
  const [header, footer] = await Promise.all([
    payload.findGlobal({ slug: 'headerNavigation', depth: 1 }),
    payload.findGlobal({ slug: 'footerNavigation', depth: 1 }),
  ])
  return { footer, header }
}

export async function getResolvedSiteConfig() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 1 })
  return resolveSiteConfig(settings)
}

export async function getSiteMetadata() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 1 })
  const resolved = resolveSiteConfig(settings)
  const favicon =
    settings.favicon && typeof settings.favicon === 'object' ? settings.favicon.url : null
  const socialImage =
    settings.meta?.image && typeof settings.meta.image === 'object' ? settings.meta.image.url : null
  return {
    description: settings.meta?.description || resolved.identity.description,
    faviconUrl: favicon || null,
    socialImageUrl: socialImage || null,
    title: settings.meta?.title || resolved.identity.siteTitle,
  }
}

export async function deliverContact(submission: ContactSubmission, request: Request) {
  if (submission.website) return
  const email = getContactEmailConfig()
  if (!email.turnstileSecret || !email.toAddress || !email.apiKey || !email.fromAddress) {
    throw new ServiceUnavailableError('Contact form is temporarily unavailable.')
  }
  await verifyTurnstile(submission.turnstileToken, 'contact', request, email.turnstileSecret)
  const payload = await getPayload({ config })
  const name = submission.name || `${submission.firstName} ${submission.lastName}`
  const companyHTML = submission.company
    ? `<p><strong>Company:</strong> ${escapeHTML(submission.company)}</p>`
    : ''
  const companyText = submission.company ? `Company: ${submission.company}\n` : ''
  try {
    await payload.sendEmail({
      html: `<h1>New website inquiry</h1><p><strong>Name:</strong> ${escapeHTML(name)}</p><p><strong>Email:</strong> ${escapeHTML(submission.email)}</p>${companyHTML}<p><strong>Message:</strong></p><p>${escapeHTML(submission.message).replace(/\n/g, '<br>')}</p>`,
      replyTo: submission.email,
      subject: `Website inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${submission.email}\n${companyText}\n${submission.message}`,
      to: email.toAddress,
    })
  } catch {
    throw new UpstreamError('Your message could not be sent. Please try again shortly.')
  }
}

export async function subscribeToNewsletter(submission: NewsletterSubmission, request: Request) {
  if (submission.website) return
  const newsletter = getNewsletterConfig()
  const payload = await getPayload({ config })
  const footer = await payload.findGlobal({ slug: 'footerNavigation', depth: 0 })
  const groupId = footer.newsletter?.show ? footer.newsletter.groupId?.trim() || null : null
  if (!groupId || !newsletter.apiKey || !newsletter.turnstileSecret) {
    throw new ServiceUnavailableError('Newsletter signup is temporarily unavailable.')
  }
  await verifyTurnstile(
    submission.turnstileToken,
    'newsletter',
    request,
    newsletter.turnstileSecret,
  )
  const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
    body: JSON.stringify({
      email: submission.email,
      fields: { last_name: submission.lastName, name: submission.firstName },
      groups: [groupId],
      status: 'active',
    }),
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${newsletter.apiKey}`,
      'content-type': 'application/json',
    },
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new UpstreamError('Subscription failed. Please try again shortly.')
}

export async function getAuthenticatedProfile(authorization: null | string) {
  const context = await authenticatedProductContext(authorization)
  return context.profiles.findById(context.userId)
}

export async function updateAuthenticatedProfile(
  authorization: null | string,
  displayName: null | string,
) {
  const context = await authenticatedProductContext(authorization)
  return context.profiles.updateDisplayName(context.userId, displayName)
}

async function authenticatedProductContext(authorization: null | string) {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) throw new UnauthorizedError()
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new ServiceUnavailableError('Product data is not configured.')
  const client = createClient<Database, 'app'>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'app' },
    global: { headers: { authorization: `Bearer ${token}` } },
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) throw new UnauthorizedError()
  return { profiles: createProfileRepository(client), userId: data.user.id }
}

async function verifyTurnstile(token: string, action: string, request: Request, secret: string) {
  const body = new URLSearchParams({ response: token, secret })
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwardedFor) body.set('remoteip', forwardedFor)
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    body,
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
  })
  const result = (await response.json()) as { action?: string; success?: boolean }
  if (!response.ok || !result.success || result.action !== action) {
    throw new ValidationError('Verification failed. Please try again.')
  }
}

function escapeHTML(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ||
      character,
  )
}

export class ServiceUnavailableError extends Error {}
export class UpstreamError extends Error {}
export class UnauthorizedError extends Error {
  constructor() {
    super('Authentication is required.')
  }
}
export class ValidationError extends Error {}
