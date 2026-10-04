import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_site_settings" ADD COLUMN "links_app_url" varchar;
  ALTER TABLE "cms_site_settings" ADD COLUMN "integrations_google_tag_manager_id" varchar;
  ALTER TABLE "cms_site_settings" ADD COLUMN "integrations_turnstile_site_key" varchar;`)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const googleTagManagerId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (appUrl) {
    await db.execute(sql`
      UPDATE "cms_site_settings"
      SET "links_app_url" = ${appUrl}
      WHERE "links_app_url" IS NULL;
    `)
  }
  if (googleTagManagerId) {
    await db.execute(sql`
      UPDATE "cms_site_settings"
      SET "integrations_google_tag_manager_id" = ${googleTagManagerId}
      WHERE "integrations_google_tag_manager_id" IS NULL;
    `)
  }
  if (turnstileSiteKey) {
    await db.execute(sql`
      UPDATE "cms_site_settings"
      SET "integrations_turnstile_site_key" = ${turnstileSiteKey}
      WHERE "integrations_turnstile_site_key" IS NULL;
    `)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_site_settings" DROP COLUMN "links_app_url";
  ALTER TABLE "cms_site_settings" DROP COLUMN "integrations_google_tag_manager_id";
  ALTER TABLE "cms_site_settings" DROP COLUMN "integrations_turnstile_site_key";`)
}
