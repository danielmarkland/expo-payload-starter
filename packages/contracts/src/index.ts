import { z } from 'zod'

export const profileSchema = z.object({
  avatarUrl: z.url().nullable(),
  createdAt: z.iso.datetime(),
  displayName: z.string().nullable(),
  id: z.uuid(),
  updatedAt: z.iso.datetime(),
})

export type Profile = z.infer<typeof profileSchema>
