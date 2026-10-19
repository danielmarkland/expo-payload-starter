import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE TYPE "public"."enum_cms_pages_blocks_call_to_action_cta_type" AS ENUM('link','newsletter');
ALTER TABLE "public"."cms_pages_blocks_call_to_action" ADD COLUMN "cta_type" "public"."enum_cms_pages_blocks_call_to_action_cta_type" DEFAULT 'link', ADD COLUMN "newsletter_destination_id" varchar, ADD COLUMN "newsletter_consent_text" varchar, ADD COLUMN "newsletter_submit_label" varchar DEFAULT 'Subscribe', ADD COLUMN "newsletter_success_message" varchar DEFAULT 'Thanks for subscribing.';
CREATE TYPE "public"."enum__cms_pages_v_blocks_call_to_action_cta_type" AS ENUM('link','newsletter');
ALTER TABLE "public"."_cms_pages_v_blocks_call_to_action" ADD COLUMN "cta_type" "public"."enum__cms_pages_v_blocks_call_to_action_cta_type" DEFAULT 'link', ADD COLUMN "newsletter_destination_id" varchar, ADD COLUMN "newsletter_consent_text" varchar, ADD COLUMN "newsletter_submit_label" varchar DEFAULT 'Subscribe', ADD COLUMN "newsletter_success_message" varchar DEFAULT 'Thanks for subscribing.';
ALTER TABLE "public"."cms_footer_navigation" ADD COLUMN "newsletter_destination_id" varchar;`)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "public"."cms_pages_blocks_call_to_action" DROP COLUMN "cta_type", DROP COLUMN "newsletter_destination_id", DROP COLUMN "newsletter_consent_text", DROP COLUMN "newsletter_submit_label", DROP COLUMN "newsletter_success_message";
DROP TYPE "public"."enum_cms_pages_blocks_call_to_action_cta_type";
ALTER TABLE "public"."_cms_pages_v_blocks_call_to_action" DROP COLUMN "cta_type", DROP COLUMN "newsletter_destination_id", DROP COLUMN "newsletter_consent_text", DROP COLUMN "newsletter_submit_label", DROP COLUMN "newsletter_success_message";
DROP TYPE "public"."enum__cms_pages_v_blocks_call_to_action_cta_type";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_destination_id";`)
}
