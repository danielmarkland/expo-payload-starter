import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_site_settings" ADD COLUMN "theme_light_accent" varchar DEFAULT '#6e685d' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_dark_accent" varchar DEFAULT '#d2c7b8' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_site_settings" DROP COLUMN "theme_light_accent";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_dark_accent";`)
}
