import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_pages_blocks_contact_form_submit_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_contact_form_submit_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  ALTER TABLE "cms_pages_blocks_contact_form" ADD COLUMN "submit_button_variant" "enum_cms_pages_blocks_contact_form_submit_button_variant" DEFAULT 'primary-filled';
  ALTER TABLE "_cms_pages_v_blocks_contact_form" ADD COLUMN "submit_button_variant" "enum__cms_pages_v_blocks_contact_form_submit_button_variant" DEFAULT 'primary-filled';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_pages_blocks_contact_form" DROP COLUMN "submit_button_variant";
  ALTER TABLE "_cms_pages_v_blocks_contact_form" DROP COLUMN "submit_button_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_contact_form_submit_button_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_contact_form_submit_button_variant";`)
}
