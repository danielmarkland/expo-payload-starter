import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_header_navigation_search_icon" AS ENUM('book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  ALTER TABLE "cms_header_navigation" ADD COLUMN "show_search" boolean DEFAULT true NOT NULL;
  ALTER TABLE "cms_header_navigation" ADD COLUMN "search_icon" "enum_cms_header_navigation_search_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_header_navigation" DROP COLUMN "show_search";
  ALTER TABLE "cms_header_navigation" DROP COLUMN "search_icon";
  DROP TYPE "public"."enum_cms_header_navigation_search_icon";`)
}
