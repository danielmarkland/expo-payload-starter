import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_site_settings_theme_default_mode" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum_cms_site_settings_theme_font_preset" AS ENUM('poppins', 'system');
  CREATE TYPE "public"."enum_cms_site_settings_theme_shape_preset" AS ENUM('square', 'soft', 'rounded');
  CREATE TYPE "public"."enum_cms_site_settings_theme_density_preset" AS ENUM('compact', 'comfortable', 'spacious');
  ALTER TABLE "cms_header_navigation" DROP CONSTRAINT "cms_header_navigation_logo_id_cms_media_id_fk";
  
  DROP INDEX "cms_header_navigation_logo_idx";
  ALTER TABLE "cms_site_settings" ALTER COLUMN "site_description" SET DEFAULT 'Dallas-based software engineer specializing in web, mobile, AI, and software architecture.';
  ALTER TABLE "cms_site_settings" ALTER COLUMN "site_description" SET NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "site_title" varchar DEFAULT 'Daniel Markland' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "app_title" varchar DEFAULT 'Daniel Markland' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "short_name" varchar DEFAULT 'D Markland' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "logo_id" integer;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_default_mode" "enum_cms_site_settings_theme_default_mode" DEFAULT 'system' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_allow_toggle" boolean DEFAULT true NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_font_preset" "enum_cms_site_settings_theme_font_preset" DEFAULT 'poppins' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_shape_preset" "enum_cms_site_settings_theme_shape_preset" DEFAULT 'soft' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_density_preset" "enum_cms_site_settings_theme_density_preset" DEFAULT 'comfortable' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_light_primary" varchar DEFAULT '#eec784' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_light_primary_ink" varchar DEFAULT '#121212' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_light_surface" varchar DEFAULT '#ffffff' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_light_surface_raised" varchar DEFAULT '#ffffff' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_light_ink" varchar DEFAULT '#231f20' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_light_ink_muted" varchar DEFAULT '#666666' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_light_border" varchar DEFAULT '#e5e5e5' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_dark_primary" varchar DEFAULT '#eec784' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_dark_primary_ink" varchar DEFAULT '#121212' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_dark_surface" varchar DEFAULT '#0f0f0f' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_dark_surface_raised" varchar DEFAULT '#161616' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_dark_ink" varchar DEFAULT '#ffffff' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_dark_ink_muted" varchar DEFAULT '#999999' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD COLUMN "theme_dark_border" varchar DEFAULT '#1e1e1e' NOT NULL;
  ALTER TABLE "cms_site_settings" ADD CONSTRAINT "cms_site_settings_logo_id_cms_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cms_site_settings_logo_idx" ON "cms_site_settings" USING btree ("logo_id");
  UPDATE "cms_site_settings"
  SET "logo_id" = (SELECT "logo_id" FROM "cms_header_navigation" LIMIT 1)
  WHERE "logo_id" IS NULL;
  ALTER TABLE "cms_header_navigation" DROP COLUMN "logo_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_site_settings" DROP CONSTRAINT "cms_site_settings_logo_id_cms_media_id_fk";
  
  DROP INDEX "cms_site_settings_logo_idx";
  ALTER TABLE "cms_site_settings" ALTER COLUMN "site_description" DROP DEFAULT;
  ALTER TABLE "cms_site_settings" ALTER COLUMN "site_description" DROP NOT NULL;
  ALTER TABLE "cms_header_navigation" ADD COLUMN "logo_id" integer;
  ALTER TABLE "cms_header_navigation" ADD CONSTRAINT "cms_header_navigation_logo_id_cms_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cms_header_navigation_logo_idx" ON "cms_header_navigation" USING btree ("logo_id");
  UPDATE "cms_header_navigation"
  SET "logo_id" = (SELECT "logo_id" FROM "cms_site_settings" LIMIT 1)
  WHERE "logo_id" IS NULL;
  ALTER TABLE "cms_site_settings" DROP COLUMN "site_title";
  ALTER TABLE "cms_site_settings" DROP COLUMN "app_title";
  ALTER TABLE "cms_site_settings" DROP COLUMN "short_name";
  ALTER TABLE "cms_site_settings" DROP COLUMN "logo_id";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_default_mode";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_allow_toggle";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_font_preset";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_shape_preset";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_density_preset";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_light_primary";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_light_primary_ink";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_light_surface";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_light_surface_raised";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_light_ink";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_light_ink_muted";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_light_border";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_dark_primary";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_dark_primary_ink";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_dark_surface";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_dark_surface_raised";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_dark_ink";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_dark_ink_muted";
  ALTER TABLE "cms_site_settings" DROP COLUMN "theme_dark_border";
  DROP TYPE "public"."enum_cms_site_settings_theme_default_mode";
  DROP TYPE "public"."enum_cms_site_settings_theme_font_preset";
  DROP TYPE "public"."enum_cms_site_settings_theme_shape_preset";
  DROP TYPE "public"."enum_cms_site_settings_theme_density_preset";`)
}
