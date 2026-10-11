import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_header_navigation_top_background" AS ENUM('fill', 'transparent');
  CREATE TYPE "public"."enum_cms_header_navigation_scrolled_background" AS ENUM('fill', 'transparent');
  ALTER TABLE "cms_header_navigation" ADD COLUMN "top_background" "enum_cms_header_navigation_top_background" DEFAULT 'fill';
  ALTER TABLE "cms_header_navigation" ADD COLUMN "scrolled_background" "enum_cms_header_navigation_scrolled_background" DEFAULT 'fill';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_header_navigation" DROP COLUMN "top_background";
  ALTER TABLE "cms_header_navigation" DROP COLUMN "scrolled_background";
  DROP TYPE "public"."enum_cms_header_navigation_top_background";
  DROP TYPE "public"."enum_cms_header_navigation_scrolled_background";`)
}
