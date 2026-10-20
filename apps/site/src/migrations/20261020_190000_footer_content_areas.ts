import type { FooterNavigation } from '../payload-types.js'
import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import {
  legacyFooterFromSQL,
  migrateFooterNavigation,
} from '@danielmarkland/publishing-core/footerMigration'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const previous = await db.execute(sql`SELECT row_to_json(f) AS footer,
    COALESCE((SELECT jsonb_agg(to_jsonb(i) ORDER BY i._order) FROM cms_footer_navigation_items i WHERE i._parent_id=f.id), '[]'::jsonb) AS items,
    COALESCE((SELECT jsonb_agg(to_jsonb(s) ORDER BY s._order) FROM cms_footer_navigation_social_links s WHERE s._parent_id=f.id), '[]'::jsonb) AS social,
    (SELECT row_to_json(settings) FROM cms_site_settings settings ORDER BY settings.id LIMIT 1) AS settings
    FROM cms_footer_navigation f`)
  await db.execute(sql`CREATE TYPE "public"."enum_ft_links_items_treatment" AS ENUM('default', 'accent');
CREATE TYPE "public"."enum_ft_links_items_type" AS ENUM('page', 'post', 'url');
CREATE TYPE "public"."enum_ft_links_items_icon" AS ENUM('apple', 'bluesky', 'discord', 'facebook', 'github', 'google-play', 'instagram', 'linkedin', 'mastodon', 'medium', 'pinterest', 'reddit', 'slack', 'spotify', 'telegram', 'threads', 'tiktok', 'twitch', 'whatsapp', 'twitter', 'youtube', 'arrow-right', 'arrow-up-right', 'bell', 'book-open', 'calendar', 'camera', 'check', 'chevron-right', 'help', 'cloud', 'download', 'external-link', 'file-text', 'globe', 'heart', 'home', 'image', 'info', 'link', 'lock', 'log-in', 'mail', 'map-pin', 'menu', 'message', 'phone', 'play', 'podcast', 'radio', 'rss', 'search', 'send', 'settings', 'share', 'shopping-bag', 'shopping-cart', 'sparkles', 'star', 'user', 'users', 'zap');
CREATE TYPE "public"."enum_ft_social_items_icon" AS ENUM('apple', 'bluesky', 'discord', 'facebook', 'github', 'google-play', 'instagram', 'linkedin', 'mastodon', 'medium', 'pinterest', 'reddit', 'slack', 'spotify', 'telegram', 'threads', 'tiktok', 'twitch', 'whatsapp', 'twitter', 'youtube', 'globe', 'mail', 'phone', 'podcast', 'rss');
CREATE TYPE "public"."enum_ft_cta_action_treatment" AS ENUM('default', 'accent');
CREATE TYPE "public"."enum_ft_cta_action_type" AS ENUM('page', 'post', 'url');
CREATE TYPE "public"."enum_ft_cta_action_icon" AS ENUM('apple', 'bluesky', 'discord', 'facebook', 'github', 'google-play', 'instagram', 'linkedin', 'mastodon', 'medium', 'pinterest', 'reddit', 'slack', 'spotify', 'telegram', 'threads', 'tiktok', 'twitch', 'whatsapp', 'twitter', 'youtube', 'arrow-right', 'arrow-up-right', 'bell', 'book-open', 'calendar', 'camera', 'check', 'chevron-right', 'help', 'cloud', 'download', 'external-link', 'file-text', 'globe', 'heart', 'home', 'image', 'info', 'link', 'lock', 'log-in', 'mail', 'map-pin', 'menu', 'message', 'phone', 'play', 'podcast', 'radio', 'rss', 'search', 'send', 'settings', 'share', 'shopping-bag', 'shopping-cart', 'sparkles', 'star', 'user', 'users', 'zap');
CREATE TYPE "public"."enum_ft_cta_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
CREATE TYPE "public"."enum_ft_nl_icon" AS ENUM('apple', 'bluesky', 'discord', 'facebook', 'github', 'google-play', 'instagram', 'linkedin', 'mastodon', 'medium', 'pinterest', 'reddit', 'slack', 'spotify', 'telegram', 'threads', 'tiktok', 'twitch', 'whatsapp', 'twitter', 'youtube', 'arrow-right', 'arrow-up-right', 'bell', 'book-open', 'calendar', 'camera', 'check', 'chevron-right', 'help', 'cloud', 'download', 'external-link', 'file-text', 'globe', 'heart', 'home', 'image', 'info', 'link', 'lock', 'log-in', 'mail', 'map-pin', 'menu', 'message', 'phone', 'play', 'podcast', 'radio', 'rss', 'search', 'send', 'settings', 'share', 'shopping-bag', 'shopping-cart', 'sparkles', 'star', 'user', 'users', 'zap');
CREATE TYPE "public"."enum_ft_nl_icon_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum_ft_nl_submit_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
CREATE TYPE "public"."enum_ft_contact_name_mode" AS ENUM('combined', 'separate');
CREATE TYPE "public"."enum_ft_contact_icon" AS ENUM('apple', 'bluesky', 'discord', 'facebook', 'github', 'google-play', 'instagram', 'linkedin', 'mastodon', 'medium', 'pinterest', 'reddit', 'slack', 'spotify', 'telegram', 'threads', 'tiktok', 'twitch', 'whatsapp', 'twitter', 'youtube', 'arrow-right', 'arrow-up-right', 'bell', 'book-open', 'calendar', 'camera', 'check', 'chevron-right', 'help', 'cloud', 'download', 'external-link', 'file-text', 'globe', 'heart', 'home', 'image', 'info', 'link', 'lock', 'log-in', 'mail', 'map-pin', 'menu', 'message', 'phone', 'play', 'podcast', 'radio', 'rss', 'search', 'send', 'settings', 'share', 'shopping-bag', 'shopping-cart', 'sparkles', 'star', 'user', 'users', 'zap');
CREATE TYPE "public"."enum_ft_contact_icon_position" AS ENUM('left', 'right');
CREATE TYPE "public"."enum_ft_contact_submit_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
CREATE TYPE "public"."enum_cms_footer_navigation_content_areas_columns_alignment" AS ENUM('start', 'center', 'end');
CREATE TABLE "ft_logo" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"block_name" varchar
);

CREATE TABLE "ft_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"heading" varchar,
	"content" jsonb,
	"block_name" varchar
);

CREATE TABLE "ft_links_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"treatment" "enum_ft_links_items_treatment",
	"label" varchar NOT NULL,
	"type" "enum_ft_links_items_type" DEFAULT 'page' NOT NULL,
	"icon" "enum_ft_links_items_icon",
	"page_id" integer,
	"post_id" integer,
	"url" varchar,
	"new_tab" boolean DEFAULT false,
	"icon_only" boolean DEFAULT false
);

CREATE TABLE "ft_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"heading" varchar,
	"block_name" varchar
);

CREATE TABLE "ft_social_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"icon" "enum_ft_social_items_icon" NOT NULL,
	"url" varchar NOT NULL,
	"new_tab" boolean DEFAULT true
);

CREATE TABLE "ft_social" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"heading" varchar,
	"block_name" varchar
);

CREATE TABLE "ft_cta" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"heading" varchar,
	"body" varchar,
	"action_treatment" "enum_ft_cta_action_treatment",
	"action_label" varchar,
	"action_type" "enum_ft_cta_action_type",
	"action_icon" "enum_ft_cta_action_icon",
	"action_page_id" integer,
	"action_post_id" integer,
	"action_url" varchar,
	"action_new_tab" boolean,
	"action_icon_only" boolean,
	"action_variant" "enum_ft_cta_action_variant" DEFAULT 'primary-filled',
	"block_name" varchar
);

CREATE TABLE "ft_posts" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"heading" varchar,
	"limit" numeric DEFAULT 2,
	"block_name" varchar
);

CREATE TABLE "ft_copy" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"owner" varchar,
	"block_name" varchar
);

CREATE TABLE "ft_nl" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"eyebrow" varchar,
	"heading" varchar DEFAULT 'Stay in the loop' NOT NULL,
	"body" varchar,
	"destination_id" varchar,
	"consent_text" varchar,
	"submit_label" varchar DEFAULT 'Subscribe' NOT NULL,
	"icon" "enum_ft_nl_icon",
	"icon_position" "enum_ft_nl_icon_position" DEFAULT 'right',
	"submit_button_variant" "enum_ft_nl_submit_button_variant" DEFAULT 'primary-filled',
	"success_message" varchar DEFAULT 'Thanks for subscribing.' NOT NULL,
	"appearance_heading_alignment" "pub_heading_align",
	"appearance_action_alignment" "pub_action_align",
	"appearance_columns" "pub_columns",
	"appearance_mobile_columns" "mc",
	"appearance_width" "pub_block_width" DEFAULT 'page',
	"appearance_card_padding" "cp",
	"appearance_heading_spacing" "hs",
	"appearance_background" "bg",
	"appearance_rounded" boolean,
	"appearance_padding_top" "pt",
	"appearance_padding_right" "pr",
	"appearance_padding_bottom" "pb",
	"appearance_padding_left" "pl",
	"appearance_margin_top" "mt",
	"appearance_margin_right" "mr",
	"appearance_margin_bottom" "mb",
	"appearance_margin_left" "ml",
	"appearance_border_top" "bt",
	"appearance_border_right" "br",
	"appearance_border_bottom" "bb",
	"appearance_border_left" "bl",
	"appearance_border_width" "bw",
	"block_name" varchar
);

CREATE TABLE "ft_contact" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true,
	"eyebrow" varchar,
	"heading" varchar DEFAULT 'How can I help?' NOT NULL,
	"body" varchar,
	"name_mode" "enum_ft_contact_name_mode",
	"show_company" boolean,
	"submit_label" varchar DEFAULT 'Send message' NOT NULL,
	"icon" "enum_ft_contact_icon",
	"icon_position" "enum_ft_contact_icon_position" DEFAULT 'right',
	"submit_button_variant" "enum_ft_contact_submit_button_variant" DEFAULT 'primary-filled',
	"success_message" varchar DEFAULT 'Thanks. Your message has been sent.' NOT NULL,
	"appearance_heading_alignment" "pub_heading_align",
	"appearance_action_alignment" "pub_action_align",
	"appearance_columns" "pub_columns",
	"appearance_mobile_columns" "mc",
	"appearance_width" "pub_block_width" DEFAULT 'page',
	"appearance_card_padding" "cp",
	"appearance_heading_spacing" "hs",
	"appearance_background" "bg",
	"appearance_rounded" boolean,
	"appearance_padding_top" "pt",
	"appearance_padding_right" "pr",
	"appearance_padding_bottom" "pb",
	"appearance_padding_left" "pl",
	"appearance_margin_top" "mt",
	"appearance_margin_right" "mr",
	"appearance_margin_bottom" "mb",
	"appearance_margin_left" "ml",
	"appearance_border_top" "bt",
	"appearance_border_right" "br",
	"appearance_border_bottom" "bb",
	"appearance_border_left" "bl",
	"appearance_border_width" "bw",
	"block_name" varchar
);

CREATE TABLE "cms_footer_navigation_content_areas_columns" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"alignment" "enum_cms_footer_navigation_content_areas_columns_alignment" DEFAULT 'start'
);

CREATE TABLE "cms_footer_navigation_content_areas" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"appearance_heading_alignment" "pub_heading_align",
	"appearance_action_alignment" "pub_action_align",
	"appearance_columns" "pub_columns",
	"appearance_mobile_columns" "mc",
	"appearance_width" "pub_block_width" DEFAULT 'page',
	"appearance_card_padding" "cp",
	"appearance_heading_spacing" "hs",
	"appearance_background" "bg",
	"appearance_rounded" boolean,
	"appearance_padding_top" "pt",
	"appearance_padding_right" "pr",
	"appearance_padding_bottom" "pb",
	"appearance_padding_left" "pl",
	"appearance_margin_top" "mt",
	"appearance_margin_right" "mr",
	"appearance_margin_bottom" "mb",
	"appearance_margin_left" "ml",
	"appearance_border_top" "bt",
	"appearance_border_right" "br",
	"appearance_border_bottom" "bb",
	"appearance_border_left" "bl",
	"appearance_border_width" "bw"
);

ALTER TABLE "cms_footer_navigation" ALTER COLUMN "background" SET DEFAULT 'page';
ALTER TABLE "cms_footer_navigation" ADD COLUMN "title" varchar DEFAULT 'Footer' NOT NULL;
ALTER TABLE "ft_logo" ADD CONSTRAINT "ft_logo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_text" ADD CONSTRAINT "ft_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_links_items" ADD CONSTRAINT "ft_links_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "ft_links_items" ADD CONSTRAINT "ft_links_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "ft_links_items" ADD CONSTRAINT "ft_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ft_links"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_links" ADD CONSTRAINT "ft_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_social_items" ADD CONSTRAINT "ft_social_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ft_social"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_social" ADD CONSTRAINT "ft_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_cta" ADD CONSTRAINT "ft_cta_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "ft_cta" ADD CONSTRAINT "ft_cta_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "ft_cta" ADD CONSTRAINT "ft_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_posts" ADD CONSTRAINT "ft_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_copy" ADD CONSTRAINT "ft_copy_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_nl" ADD CONSTRAINT "ft_nl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ft_contact" ADD CONSTRAINT "ft_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cms_footer_navigation_content_areas_columns" ADD CONSTRAINT "cms_footer_navigation_content_areas_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation_content_areas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cms_footer_navigation_content_areas" ADD CONSTRAINT "cms_footer_navigation_content_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "ft_logo_order_idx" ON "ft_logo" USING btree ("_order");
CREATE INDEX "ft_logo_parent_id_idx" ON "ft_logo" USING btree ("_parent_id");
CREATE INDEX "ft_logo_path_idx" ON "ft_logo" USING btree ("_path");
CREATE INDEX "ft_text_order_idx" ON "ft_text" USING btree ("_order");
CREATE INDEX "ft_text_parent_id_idx" ON "ft_text" USING btree ("_parent_id");
CREATE INDEX "ft_text_path_idx" ON "ft_text" USING btree ("_path");
CREATE INDEX "ft_links_items_order_idx" ON "ft_links_items" USING btree ("_order");
CREATE INDEX "ft_links_items_parent_id_idx" ON "ft_links_items" USING btree ("_parent_id");
CREATE INDEX "ft_links_items_page_idx" ON "ft_links_items" USING btree ("page_id");
CREATE INDEX "ft_links_items_post_idx" ON "ft_links_items" USING btree ("post_id");
CREATE INDEX "ft_links_order_idx" ON "ft_links" USING btree ("_order");
CREATE INDEX "ft_links_parent_id_idx" ON "ft_links" USING btree ("_parent_id");
CREATE INDEX "ft_links_path_idx" ON "ft_links" USING btree ("_path");
CREATE INDEX "ft_social_items_order_idx" ON "ft_social_items" USING btree ("_order");
CREATE INDEX "ft_social_items_parent_id_idx" ON "ft_social_items" USING btree ("_parent_id");
CREATE INDEX "ft_social_order_idx" ON "ft_social" USING btree ("_order");
CREATE INDEX "ft_social_parent_id_idx" ON "ft_social" USING btree ("_parent_id");
CREATE INDEX "ft_social_path_idx" ON "ft_social" USING btree ("_path");
CREATE INDEX "ft_cta_order_idx" ON "ft_cta" USING btree ("_order");
CREATE INDEX "ft_cta_parent_id_idx" ON "ft_cta" USING btree ("_parent_id");
CREATE INDEX "ft_cta_path_idx" ON "ft_cta" USING btree ("_path");
CREATE INDEX "ft_cta_action_action_page_idx" ON "ft_cta" USING btree ("action_page_id");
CREATE INDEX "ft_cta_action_action_post_idx" ON "ft_cta" USING btree ("action_post_id");
CREATE INDEX "ft_posts_order_idx" ON "ft_posts" USING btree ("_order");
CREATE INDEX "ft_posts_parent_id_idx" ON "ft_posts" USING btree ("_parent_id");
CREATE INDEX "ft_posts_path_idx" ON "ft_posts" USING btree ("_path");
CREATE INDEX "ft_copy_order_idx" ON "ft_copy" USING btree ("_order");
CREATE INDEX "ft_copy_parent_id_idx" ON "ft_copy" USING btree ("_parent_id");
CREATE INDEX "ft_copy_path_idx" ON "ft_copy" USING btree ("_path");
CREATE INDEX "ft_nl_order_idx" ON "ft_nl" USING btree ("_order");
CREATE INDEX "ft_nl_parent_id_idx" ON "ft_nl" USING btree ("_parent_id");
CREATE INDEX "ft_nl_path_idx" ON "ft_nl" USING btree ("_path");
CREATE INDEX "ft_contact_order_idx" ON "ft_contact" USING btree ("_order");
CREATE INDEX "ft_contact_parent_id_idx" ON "ft_contact" USING btree ("_parent_id");
CREATE INDEX "ft_contact_path_idx" ON "ft_contact" USING btree ("_path");
CREATE INDEX "cms_footer_navigation_content_areas_columns_order_idx" ON "cms_footer_navigation_content_areas_columns" USING btree ("_order");
CREATE INDEX "cms_footer_navigation_content_areas_columns_parent_id_idx" ON "cms_footer_navigation_content_areas_columns" USING btree ("_parent_id");
CREATE INDEX "cms_footer_navigation_content_areas_order_idx" ON "cms_footer_navigation_content_areas" USING btree ("_order");
CREATE INDEX "cms_footer_navigation_content_areas_parent_id_idx" ON "cms_footer_navigation_content_areas" USING btree ("_parent_id");`)
  for (const row of previous.rows as {
    footer: Record<string, unknown>
    items: Record<string, unknown>[]
    social: Record<string, unknown>[]
    settings: { site_title?: string; site_description?: string } | null
  }[]) {
    const data = migrateFooterNavigation(legacyFooterFromSQL(row.footer, row.items, row.social), {
      siteTitle: row.settings?.site_title || String(row.footer.copyright_owner || 'Footer'),
      description: row.settings?.site_description || '',
    })
    await payload.updateGlobal({
      slug: 'footerNavigation',
      data: data as Partial<FooterNavigation>,
      overrideAccess: true,
      req,
    })
  }
  await db.execute(sql`DROP TABLE "public"."cms_footer_navigation_social_links";
DROP TABLE "public"."cms_footer_navigation_items";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "layout_preset";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "details_alignment";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "social_placement";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "details";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_show";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_eyebrow";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_heading";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_body";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_destination_id";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_submit_label";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_icon";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_icon_position";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_submit_button_variant";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_success_message";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_consent_text";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_heading_alignment";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_action_alignment";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_columns";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_mobile_columns";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_width";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_card_padding";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_heading_spacing";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_background";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_rounded";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_padding_top";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_padding_right";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_padding_bottom";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_padding_left";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_margin_top";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_margin_right";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_margin_bottom";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_margin_left";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_top";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_right";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_bottom";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_left";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "newsletter_appearance_border_width";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_show";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_eyebrow";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_heading";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_body";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_name_mode";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_show_company";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_submit_label";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_icon";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_icon_position";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_submit_button_variant";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_success_message";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_heading_alignment";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_action_alignment";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_columns";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_mobile_columns";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_width";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_card_padding";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_heading_spacing";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_background";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_rounded";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_padding_top";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_padding_right";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_padding_bottom";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_padding_left";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_margin_top";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_margin_right";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_margin_bottom";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_margin_left";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_top";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_right";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_bottom";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_left";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "contact_form_appearance_border_width";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "tagline";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "latest_posts_limit";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "latest_posts_show";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "latest_posts_heading";
ALTER TABLE "public"."cms_footer_navigation" DROP COLUMN "copyright_owner";
DROP TYPE "public"."enum_cms_footer_navigation_social_links_icon";
DROP TYPE "public"."enum_cms_footer_navigation_items_treatment";
DROP TYPE "public"."enum_cms_footer_navigation_items_type";
DROP TYPE "public"."enum_cms_footer_navigation_items_icon";
DROP TYPE "public"."enum_cms_footer_navigation_layout_preset";
DROP TYPE "public"."enum_cms_footer_navigation_details_alignment";
DROP TYPE "public"."enum_cms_footer_navigation_social_placement";
DROP TYPE "public"."enum_cms_footer_navigation_newsletter_icon";
DROP TYPE "public"."enum_cms_footer_navigation_newsletter_icon_position";
DROP TYPE "public"."enum_cms_footer_navigation_newsletter_submit_button_variant";
DROP TYPE "public"."enum_cms_footer_navigation_contact_form_name_mode";
DROP TYPE "public"."enum_cms_footer_navigation_contact_form_icon";
DROP TYPE "public"."enum_cms_footer_navigation_contact_form_icon_position";
DROP TYPE "public"."enum_cms_footer_navigation_contact_form_submit_button_variant";`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error(
    'The composable footer cannot be reduced to the retired fixed layout without losing content. Restore a pre-migration database backup to reverse this migration.',
  )
}
