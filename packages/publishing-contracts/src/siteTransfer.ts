import { z } from 'zod'

const key = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9_.:-]+$/)
const path = z
  .array(
    z.union([
      z
        .string()
        .min(1)
        .refine((v) => !['__proto__', 'prototype', 'constructor'].includes(v)),
      z.number().int().nonnegative(),
    ]),
  )
  .min(1)
  .max(100)
export const siteTransferReferenceSchema = z
  .object({ path, target: key })
  .strict()
export const siteTransferStateSchema = z
  .object({
    data: z.record(z.string(), z.json()),
    references: z.array(siteTransferReferenceSchema).max(100000),
  })
  .strict()
export const siteTransferRecordSchema = z
  .object({
    key,
    resource: key,
    current: siteTransferStateSchema,
    draft: z.boolean(),
    published: siteTransferStateSchema.optional(),
    asset: key.optional(),
  })
  .strict()
export const siteTransferManifestSchema = z
  .object({
    format: z.literal('publishing-site'),
    version: z.literal(1),
    createdAt: z.iso.datetime(),
    resources: z.array(key).min(1).max(100),
    extensions: z.record(key, z.literal(1)),
    records: z.array(siteTransferRecordSchema).max(100000),
    assets: z
      .array(
        z
          .object({
            key,
            path: z.string().regex(/^assets\/[a-f0-9]{64}$/),
            sha256: z.string().regex(/^[a-f0-9]{64}$/),
            size: z.number().int().nonnegative().max(536870912),
            mimeType: z.string().min(1).max(200),
            filename: z
              .string()
              .min(1)
              .max(200)
              .refine(
                (v) => !/[\\/\x00-\x1f]/.test(v) && v !== '.' && v !== '..',
              ),
          })
          .strict(),
      )
      .max(100000),
  })
  .strict()

export type SiteTransferManifest = z.infer<typeof siteTransferManifestSchema>
export type SiteTransferRecord = z.infer<typeof siteTransferRecordSchema>
export type SiteTransferState = z.infer<typeof siteTransferStateSchema>
export type SiteTransferReference = z.infer<typeof siteTransferReferenceSchema>
