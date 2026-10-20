import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "cms_site_settings"
    ADD COLUMN "logo_max_width" numeric DEFAULT 240,
    ADD COLUMN "logo_max_height" numeric DEFAULT 56;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "cms_site_settings"
    DROP COLUMN "logo_max_width", DROP COLUMN "logo_max_height";`)
}
