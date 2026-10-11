import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_media" ADD COLUMN "prefix" varchar DEFAULT '';
  ALTER TABLE "cms_media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;`)
}

// Storage keys predate this beta cutover; rolling back identity must retain them.
export async function down(): Promise<void> {}
