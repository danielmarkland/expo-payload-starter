import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE TYPE "public"."enum_cms_footer_navigation_background" AS ENUM('page','dark');
    ALTER TABLE "public"."cms_footer_navigation" ADD COLUMN "background" "public"."enum_cms_footer_navigation_background" DEFAULT 'page';`)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "background";
    DROP TYPE "public"."enum_cms_footer_navigation_background";`)
}
