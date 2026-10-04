import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_footer_navigation_newsletter_submit_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_footer_navigation_contact_form_submit_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_show" boolean DEFAULT false NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_eyebrow" varchar DEFAULT 'Newsletter';
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_heading" varchar DEFAULT 'Stay in the loop' NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_body" varchar DEFAULT 'Get occasional updates delivered to your inbox.';
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_group_id" varchar;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_submit_label" varchar DEFAULT 'Subscribe' NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_submit_button_variant" "enum_cms_footer_navigation_newsletter_submit_button_variant" DEFAULT 'primary-filled';
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_success_message" varchar DEFAULT 'Thanks for subscribing.' NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_consent_text" varchar DEFAULT 'By subscribing, you agree to receive email updates. Unsubscribe anytime.';
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_content_width" "cw";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_background" "bg";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_rounded" boolean;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_padding_top" "pt";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_padding_right" "pr";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_padding_bottom" "pb";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_padding_left" "pl";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_margin_top" "mt";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_margin_right" "mr";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_margin_bottom" "mb";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_margin_left" "ml";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_border_top" "bt";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_border_right" "br";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_border_bottom" "bb";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_border_left" "bl";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_appearance_border_width" "bw";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_show" boolean DEFAULT false NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_eyebrow" varchar DEFAULT 'Contact';
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_heading" varchar DEFAULT 'How can I help?' NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_body" varchar;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_submit_label" varchar DEFAULT 'Send message' NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_submit_button_variant" "enum_cms_footer_navigation_contact_form_submit_button_variant" DEFAULT 'primary-filled';
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_success_message" varchar DEFAULT 'Thanks. Your message has been sent.' NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_content_width" "cw";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_background" "bg";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_rounded" boolean;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_padding_top" "pt";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_padding_right" "pr";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_padding_bottom" "pb";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_padding_left" "pl";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_margin_top" "mt";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_margin_right" "mr";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_margin_bottom" "mb";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_margin_left" "ml";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_border_top" "bt";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_border_right" "br";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_border_bottom" "bb";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_border_left" "bl";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_appearance_border_width" "bw";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_show";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_eyebrow";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_heading";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_body";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_group_id";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_submit_label";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_submit_button_variant";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_success_message";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_consent_text";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_content_width";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_background";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_rounded";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_padding_top";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_padding_right";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_padding_bottom";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_padding_left";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_margin_top";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_margin_right";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_margin_bottom";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_margin_left";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_top";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_right";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_bottom";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_left";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_width";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_show";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_eyebrow";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_heading";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_body";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_submit_label";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_submit_button_variant";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_success_message";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_content_width";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_background";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_rounded";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_padding_top";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_padding_right";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_padding_bottom";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_padding_left";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_margin_top";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_margin_right";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_margin_bottom";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_margin_left";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_top";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_right";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_bottom";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_left";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_width";
  DROP TYPE "public"."enum_cms_footer_navigation_newsletter_submit_button_variant";
  DROP TYPE "public"."enum_cms_footer_navigation_contact_form_submit_button_variant";`)
}
