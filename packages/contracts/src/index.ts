import { z } from 'zod'

export const profileSchema = z.object({
  avatarUrl: z.url().nullable(),
  createdAt: z.iso.datetime(),
  displayName: z.string().nullable(),
  id: z.uuid(),
  updatedAt: z.iso.datetime(),
})

export type Profile = z.infer<typeof profileSchema>

export const welcomeEmailRequestSchema = z.object({
  idempotencyKey: z.uuid(),
})

export type WelcomeEmailRequest = z.infer<typeof welcomeEmailRequestSchema>

export const emailDeliveryEventSchema = z.object({
  createdAt: z.iso.datetime(),
  emailId: z.string().min(1),
  status: z.enum(['sent', 'delivered', 'bounced', 'complained']),
})

export type EmailDeliveryEvent = z.infer<typeof emailDeliveryEventSchema>
