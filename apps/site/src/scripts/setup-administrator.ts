import { getPayload } from 'payload'
import { createHeroHeadline } from '@danielmarkland/publishing-core'
import config from '../payload.config'
import { identityServer, identityDatabase } from '../lib/identity/server'

// Operator-only bootstrap. Never expose this as an HTTP signup or grant roles by email matching.
const email = process.env.STARTER_SETUP_EMAIL
const password = process.env.STARTER_SETUP_PASSWORD
if (!email || !password || password.length < 32) throw Error('Private setup credentials required')
const payload = await getPayload({ config })
try {
  const existing = await payload.find({ collection: 'users', limit: 1, overrideAccess: true })
  if (existing.totalDocs) {
    const user = existing.docs[0]
    if (user.email !== email || user.role !== 'admin' || !user.authIdentityId)
      throw Error('Existing CMS administrator requires explicit operator reconciliation')
    console.log('Existing linked administrator preserved')
  } else {
    const auth = await identityServer('editor')
    const context = await auth.$context
    const known = await identityDatabase().query(
      "select id from identity.records where realm='platform' and model='user' and lower(data->>'email')=lower($1)",
      [email],
    )
    if (known.rowCount)
      throw Error('Existing editorial identity requires explicit operator reconciliation')
    const user = await context.internalAdapter.createUser(
      { name: email, email, emailVerified: true },
      { method: 'admin' },
    )
    try {
      await context.internalAdapter.createAccount({
        userId: user.id,
        providerId: 'credential',
        accountId: user.id,
        password: await context.password.hash(password),
      })
      await payload.create({
        collection: 'users',
        data: { email, role: 'admin', authIdentityId: user.id },
        overrideAccess: true,
      })
    } catch {
      await context.internalAdapter.deleteUser(user.id)
      throw Error('Administrator creation failed; provisional editorial identity removed')
    }
    console.log('Verified administrator provisioned; public editorial signup disabled')
  }
  const customerAuth = await identityServer('customer')
  const customerContext = await customerAuth.$context
  const realm = (await customerContext.internalAdapter.findUserByEmail(email))?.user
  if (!realm) {
    const customerPassword = process.env.STARTER_SETUP_CUSTOMER_PASSWORD
    if (!customerPassword || customerPassword.length < 32)
      throw Error('Private customer setup password required')
    const customer = await customerContext.internalAdapter.createUser(
      { name: email, email, emailVerified: true },
      { method: 'admin' },
    )
    try {
      await customerContext.internalAdapter.createAccount({
        userId: customer.id,
        providerId: 'credential',
        accountId: customer.id,
        password: await customerContext.password.hash(customerPassword),
      })
    } catch {
      await customerContext.internalAdapter.deleteUser(customer.id)
      throw Error('Customer bootstrap failed; provisional identity removed')
    }
    console.log('Independent customer account provisioned; no CMS role inherited')
  }
  const home = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    overrideAccess: true,
  })
  if (!home.totalDocs) {
    await payload.create({
      collection: 'pages',
      draft: true,
      data: {
        title: 'Welcome',
        slug: 'home',
        layout: [{ blockType: 'hero', heading: createHeroHeadline('Your new website') }],
        _status: 'draft',
      },
      overrideAccess: true,
    })
    console.log('Starter homepage draft created; complete SEO metadata before publishing')
  }
} finally {
  await payload.destroy()
  await identityDatabase().end()
}

// Better Auth retains background handles; this operator command is one-shot.
process.exit(0)
