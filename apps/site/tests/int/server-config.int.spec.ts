import { describe, expect, it } from 'vitest'

import {
  getContactEmailConfig,
  getNewsletterConfig,
  getPreviewSecret,
  getSiteURL,
  getStorageConfig,
} from '@/lib/serverConfig'

describe('server configuration', () => {
  it('resolves canonical site URLs in explicit and Vercel configuration', () => {
    expect(
      getSiteURL({
        SITE_URL: 'https://preview.example.com/',
        VERCEL_PROJECT_PRODUCTION_URL: 'www.example.com',
      }),
    ).toBe('https://preview.example.com')
    expect(getSiteURL({ VERCEL_PROJECT_PRODUCTION_URL: 'www.example.com' })).toBe(
      'https://www.example.com',
    )
    expect(() => getSiteURL({})).toThrow('SITE_URL or VERCEL_PROJECT_PRODUCTION_URL is required.')
  })

  it('derives a stable preview token from Payload secret material', () => {
    const first = getPreviewSecret({ PAYLOAD_SECRET: 'first-secret' })
    expect(getPreviewSecret({ PAYLOAD_SECRET: 'first-secret' })).toBe(first)
    expect(getPreviewSecret({ PAYLOAD_SECRET: 'second-secret' })).not.toBe(first)
    expect(() => getPreviewSecret({})).toThrow('PAYLOAD_SECRET is required')
  })

  it('uses the sender as the default contact recipient', () => {
    expect(
      getContactEmailConfig({
        EMAIL_FROM_ADDRESS: 'sender@example.com',
        RESEND_API_KEY: 're_test',
        TURNSTILE_SECRET_KEY: 'secret',
      }),
    ).toMatchObject({
      fromAddress: 'sender@example.com',
      toAddress: 'sender@example.com',
    })
  })

  it('reports an incomplete Resend configuration', () => {
    expect(() => getContactEmailConfig({ RESEND_API_KEY: 're_test' })).toThrow(
      'EMAIL_FROM_ADDRESS is required',
    )
  })

  it('keeps MailerLite and Turnstile newsletter credentials server-side', () => {
    expect(
      getNewsletterConfig({
        MAILERLITE_API_KEY: 'mailer-secret',
        TURNSTILE_SECRET_KEY: 'turnstile-secret',
      }),
    ).toEqual({ apiKey: 'mailer-secret', turnstileSecret: 'turnstile-secret' })
  })

  it('fixes the Payload media bucket while retaining provider-required S3 values', () => {
    expect(
      getStorageConfig({
        SUPABASE_S3_ACCESS_KEY_ID: 'access',
        SUPABASE_S3_ENDPOINT: 'https://project.storage.supabase.co/storage/v1/s3',
        SUPABASE_S3_REGION: 'us-west-2',
        SUPABASE_S3_SECRET_ACCESS_KEY: 'secret',
      }),
    ).toEqual({
      accessKeyId: 'access',
      bucket: 'cms-media',
      endpoint: 'https://project.storage.supabase.co/storage/v1/s3',
      region: 'us-west-2',
      secretAccessKey: 'secret',
    })
  })

  it('reports incomplete S3 configuration on Vercel', () => {
    expect(() => getStorageConfig({ VERCEL: '1' })).toThrow(
      'Payload media storage is missing required Vercel configuration',
    )
  })
})
