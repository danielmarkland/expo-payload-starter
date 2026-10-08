import { createHmac } from 'node:crypto'
import { Pool } from 'pg'
import {
  createRealmAuth,
  bearer,
  expo,
  twilioVerification,
  sendIdentityEmail,
  type IdentityProviders,
} from '@danielmarkland/auth-runtime/server'
import { realmKey, type IdentityRealm } from '@danielmarkland/auth-runtime'
import {
  getDatabasePoolConfig,
  getSiteURL,
} from '@danielmarkland/publishing-core/serverEnvironment'
import {
  ServiceUnavailableError,
  UnauthorizedError,
} from '@danielmarkland/publishing-core/serviceErrors'
let pool: Pool | undefined
export const identityDatabase = () => (pool ??= new Pool(getDatabasePoolConfig()))
export const betterAuthEnabled = () => process.env.AUTH_PROVIDER === 'better-auth'
export async function productRealm(): Promise<IdentityRealm> {
  const result = await identityDatabase().query<{ tenant_id: string }>(
    'select tenant_id from app.identity_context where singleton=true',
  )
  const tenantId = result.rows[0]?.tenant_id
  if (!tenantId || (process.env.AUTH_TENANT_ID && process.env.AUTH_TENANT_ID !== tenantId))
    throw new ServiceUnavailableError('Product identity context is missing or mismatched')
  return { kind: 'customer', tenantId }
}
function providers(prefix: string): IdentityProviders {
  const social = (provider: string) => {
    const clientId = process.env[`${prefix}_${provider}_CLIENT_ID`],
      clientSecret = process.env[`${prefix}_${provider}_CLIENT_SECRET`]
    if (Boolean(clientId) !== Boolean(clientSecret))
      throw new ServiceUnavailableError(`Incomplete ${provider} configuration`)
    return clientId && clientSecret ? { clientId, clientSecret } : undefined
  }
  const accountSid = process.env[`${prefix}_TWILIO_ACCOUNT_SID`],
    authToken = process.env[`${prefix}_TWILIO_AUTH_TOKEN`],
    verifyServiceSid = process.env[`${prefix}_TWILIO_VERIFY_SERVICE_SID`]
  if (
    [accountSid, authToken, verifyServiceSid].some(Boolean) &&
    ![accountSid, authToken, verifyServiceSid].every(Boolean)
  )
    throw new ServiceUnavailableError('Incomplete SMS configuration')
  const apiKey = process.env[`${prefix}_EMAIL_API_KEY`],
    from = process.env[`${prefix}_EMAIL_FROM`]
  if (Boolean(apiKey) !== Boolean(from))
    throw new ServiceUnavailableError('Incomplete email configuration')
  return {
    google: social('GOOGLE'),
    facebook: social('FACEBOOK'),
    ...(accountSid && authToken && verifyServiceSid
      ? { twilio: { accountSid, authToken, verifyServiceSid } }
      : {}),
    ...(apiKey && from ? { email: { apiKey, from } } : {}),
  }
}
export async function identityServer(kind: 'customer' | 'editor' = 'customer') {
  if (!betterAuthEnabled()) throw new ServiceUnavailableError('Better Auth has not been activated')
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32)
    throw new ServiceUnavailableError('Auth secret is not configured')
  const realm: IdentityRealm = kind === 'editor' ? { kind: 'platform' } : await productRealm(),
    key = realmKey(realm),
    config = providers(kind === 'editor' ? 'EDITOR_AUTH' : 'AUTH')
  const trustedOrigins = (process.env.AUTH_TRUSTED_ORIGINS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  return createRealmAuth({
    pool: identityDatabase(),
    realm,
    baseURL: getSiteURL(),
    basePath: kind === 'editor' ? '/api/editor-auth' : '/api/auth',
    secret: createHmac('sha256', secret).update(key).digest('hex'),
    trustedOrigins,
    plugins: kind === 'customer' ? [bearer(), expo()] : [],
    socialProviders: {
      ...(config.google ? { google: config.google } : {}),
      ...(config.facebook ? { facebook: config.facebook } : {}),
    },
    sendPhoneOTP: config.twilio
      ? async (phone) => {
          await twilioVerification(config.twilio!, phone)
        }
      : undefined,
    verifyPhoneOTP: config.twilio
      ? (phone, code) => twilioVerification(config.twilio!, phone, code)
      : undefined,
    sendVerificationEmail: config.email
      ? ({ user, url }) => sendIdentityEmail(config.email!, user.email, url, 'verification')
      : undefined,
    sendResetPassword: config.email
      ? ({ user, url }) => sendIdentityEmail(config.email!, user.email, url, 'reset')
      : undefined,
  })
}
export async function authenticatedIdentity(
  headers: Headers,
  kind: 'customer' | 'editor' = 'customer',
) {
  const session = await (await identityServer(kind)).api.getSession({ headers })
  if (
    !session ||
    (session.user as { isAnonymous?: boolean; banned?: boolean }).isAnonymous ||
    (session?.user as { banned?: boolean } | undefined)?.banned
  )
    throw new UnauthorizedError()
  return session
}

export function configuredIdentityProviders(kind: 'customer' | 'editor' = 'customer') {
  const config = providers(kind === 'editor' ? 'EDITOR_AUTH' : 'AUTH')
  return {
    google: Boolean(config.google),
    facebook: Boolean(config.facebook),
    sms: Boolean(config.twilio),
    email: Boolean(config.email),
  }
}
