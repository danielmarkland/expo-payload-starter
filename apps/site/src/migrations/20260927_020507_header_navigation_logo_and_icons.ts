import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_header_navigation_items_icon" AS ENUM('book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube');
  ALTER TABLE "cms_header_navigation_items" ADD COLUMN "icon" "enum_cms_header_navigation_items_icon";
  ALTER TABLE "cms_header_navigation_items" ADD COLUMN "icon_only" boolean DEFAULT false;
  ALTER TABLE "cms_header_navigation" ADD COLUMN "logo_id" integer;
  ALTER TABLE "cms_header_navigation" ADD CONSTRAINT "cms_header_navigation_logo_id_cms_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cms_header_navigation_logo_idx" ON "cms_header_navigation" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_header_navigation" DROP CONSTRAINT "cms_header_navigation_logo_id_cms_media_id_fk";
  
  DROP INDEX "cms_header_navigation_logo_idx";
  ALTER TABLE "cms_header_navigation_items" DROP COLUMN "icon";
  ALTER TABLE "cms_header_navigation_items" DROP COLUMN "icon_only";
  ALTER TABLE "cms_header_navigation" DROP COLUMN "logo_id";
  DROP TYPE "public"."enum_cms_header_navigation_items_icon";`)
}
