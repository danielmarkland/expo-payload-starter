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

export const contactSubmissionSchema = z.object({
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
  name: z.string().trim().min(2).max(100),
  turnstileToken: z.string().min(1).max(2048),
  website: z.string().max(200).optional().default(''),
})

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>
