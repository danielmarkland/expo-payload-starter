import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_site_settings" RENAME COLUMN "logo_id" TO "dark_logo_id";
  ALTER TABLE "cms_site_settings" DROP CONSTRAINT "cms_site_settings_logo_id_cms_media_id_fk";
  
  DROP INDEX "cms_site_settings_logo_idx";
  ALTER TABLE "cms_site_settings" ADD COLUMN "light_logo_id" integer;
  ALTER TABLE "cms_site_settings" ADD CONSTRAINT "cms_site_settings_light_logo_id_cms_media_id_fk" FOREIGN KEY ("light_logo_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_site_settings" ADD CONSTRAINT "cms_site_settings_dark_logo_id_cms_media_id_fk" FOREIGN KEY ("dark_logo_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cms_site_settings_light_logo_idx" ON "cms_site_settings" USING btree ("light_logo_id");
  CREATE INDEX "cms_site_settings_dark_logo_idx" ON "cms_site_settings" USING btree ("dark_logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_site_settings" RENAME COLUMN "dark_logo_id" TO "logo_id";
  ALTER TABLE "cms_site_settings" DROP CONSTRAINT "cms_site_settings_light_logo_id_cms_media_id_fk";
  
  ALTER TABLE "cms_site_settings" DROP CONSTRAINT "cms_site_settings_dark_logo_id_cms_media_id_fk";
  
  DROP INDEX "cms_site_settings_light_logo_idx";
  DROP INDEX "cms_site_settings_dark_logo_idx";
  ALTER TABLE "cms_site_settings" ADD CONSTRAINT "cms_site_settings_logo_id_cms_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cms_site_settings_logo_idx" ON "cms_site_settings" USING btree ("logo_id");
  ALTER TABLE "cms_site_settings" DROP COLUMN "light_logo_id";`)
}
