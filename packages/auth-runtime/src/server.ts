import { oauthProvider } from '@better-auth/oauth-provider'
import {
  betterAuth,
  type BetterAuthOptions,
  type Auth,
  type BetterAuthPlugin,
} from 'better-auth'
import { admin, anonymous, phoneNumber } from 'better-auth/plugins'
import type { Pool } from 'pg'
import { createHash } from 'node:crypto'
import { realmKey, type IdentityRealm } from './index.js'
import { scopedPostgresAdapter } from './adapter.js'
export { scopedPostgresAdapter, authSchemaSQL } from './adapter.js'
export {
  oauthProvider,
  oauthProviderAuthServerMetadata,
  verifyOAuthQueryParams,
} from '@better-auth/oauth-provider'
export { oauthProviderResourceClient } from '@better-auth/oauth-provider/resource-client'
export { jwt, bearer } from 'better-auth/plugins'
export { expo } from '@better-auth/expo'
export { toNextJsHandler } from 'better-auth/next-js'
export type RealmAuthConfiguration = {
  pool: Pool
  realm: IdentityRealm
  baseURL: string
  basePath?: string
  trustedOrigins?: string[]
  secret: string
  socialProviders?: BetterAuthOptions['socialProviders']
  verifyPhoneOTP?: (phone: string, code: string) => Promise<boolean>
  sendVerificationEmail?: NonNullable<
    BetterAuthOptions['emailVerification']
  >['sendVerificationEmail']
  sendPhoneOTP?: (phone: string, code: string) => Promise<void>
  sendResetPassword?: NonNullable<
    BetterAuthOptions['emailAndPassword']
  >['sendResetPassword']
  plugins?: BetterAuthOptions['plugins']
}
export function createRealmAuth(config: RealmAuthConfiguration): Auth {
  return betterAuth<BetterAuthOptions>(realmOptions(config))
}
type DeveloperAuthOptions = BetterAuthOptions & {
  plugins: [ReturnType<typeof oauthProvider>, ...BetterAuthPlugin[]]
}
export type DeveloperAuth = Auth<DeveloperAuthOptions>
export function createDeveloperAuth(
  config: RealmAuthConfiguration & { realm: { kind: 'platform' } },
  oauth: Parameters<typeof oauthProvider>[0],
): DeveloperAuth {
  const options = realmOptions(config)
  return betterAuth<DeveloperAuthOptions>({
    ...options,
    plugins: [
      oauthProvider({ ...oauth, disableJwtPlugin: true }),
      ...(options.plugins ?? []),
    ],
  })
}
function realmOptions(config: RealmAuthConfiguration): BetterAuthOptions {
  const url = new URL(config.baseURL)
  if (
    url.protocol !== 'https:' &&
    !(
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1'].includes(url.hostname)
    )
  )
    throw new Error('Auth requires an HTTPS origin')
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  )
    throw new Error('Invalid auth origin')
  if (config.secret.length < 32)
    throw new Error('Auth secret must be at least 32 characters')
  if (config.basePath && !/^\/api\/[a-z0-9-]+$/.test(config.basePath))
    throw new Error('Invalid auth path')
  const namespace = realmKey(config.realm)
  const cookiePrefix =
    'gp_' + createHash('sha256').update(namespace).digest('hex').slice(0, 16)
  return {
    baseURL: url.href,
    basePath: config.basePath,
    trustedOrigins: config.trustedOrigins,
    secret: config.secret,
    database: scopedPostgresAdapter(config.pool, config.realm),
    socialProviders: config.socialProviders,
    user: config.sendPhoneOTP
      ? {
          additionalFields: {
            phoneNumber: {
              type: 'string',
              required: false,
              input: false,
              unique: true,
            },
            phoneNumberVerified: {
              type: 'boolean',
              required: false,
              input: false,
              defaultValue: false,
            },
          },
        }
      : undefined,
    emailAndPassword: {
      enabled: Boolean(
        config.sendVerificationEmail && config.sendResetPassword,
      ),
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: config.sendResetPassword,
    },
    emailVerification: { sendVerificationEmail: config.sendVerificationEmail },
    session: {
      expiresIn:
        config.realm.kind === 'customer' ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
      cookieCache: { enabled: false },
    },
    account: { accountLinking: { enabled: false } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 100 },
    advanced: {
      cookiePrefix,
      crossSubDomainCookies: { enabled: false },
      database: { generateId: 'uuid' },
    },
    plugins: [
      admin({ defaultRole: 'user' }),
      ...(config.realm.kind === 'customer'
        ? [anonymous({ disableDeleteAnonymousUser: true })]
        : []),
      ...(config.sendPhoneOTP
        ? [
            phoneNumber({
              sendOTP: ({ phoneNumber, code }) =>
                config.sendPhoneOTP!(phoneNumber, code),
              verifyOTP: config.verifyPhoneOTP
                ? ({ phoneNumber, code }) =>
                    config.verifyPhoneOTP!(phoneNumber, code)
                : undefined,
              phoneNumberValidator: (phone) => /^\+[1-9]\d{7,14}$/.test(phone),
              signUpOnVerification: {
                getTempEmail: (phone) =>
                  `phone-${createHash('sha256').update(phone).digest('hex')}@identity.invalid`,
              },
              requireVerification: true,
              otpLength: 6,
              expiresIn: 300,
              allowedAttempts: 5,
            }),
          ]
        : []),
      ...(config.plugins ?? []),
    ],
  }
}

export {
  twilioVerification,
  sendIdentityEmail,
  type IdentityProviders,
} from './providers.js'
