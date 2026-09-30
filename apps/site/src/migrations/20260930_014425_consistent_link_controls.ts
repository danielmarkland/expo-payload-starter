import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_pages_blocks_hero_primary_button_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_hero_primary_button_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_hero_primary_button_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_pages_blocks_hero_secondary_button_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_hero_secondary_button_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_hero_secondary_button_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_pages_blocks_feature_grid_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_feature_grid_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_feature_grid_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_pages_blocks_split_content_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_split_content_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_split_content_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_pages_blocks_link_grid_items_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_link_grid_items_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_link_grid_items_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_pages_blocks_link_grid_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_link_grid_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_link_grid_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_pages_blocks_portfolio_grid_items_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_portfolio_grid_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_portfolio_grid_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_portfolio_grid_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_pages_blocks_call_to_action_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_call_to_action_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_call_to_action_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_pages_blocks_call_to_action_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_pages_blocks_logo_cloud_items_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_pages_blocks_contact_form_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_pages_blocks_contact_form_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_primary_button_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_primary_button_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_primary_button_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_secondary_button_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_secondary_button_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_secondary_button_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_feature_grid_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_feature_grid_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_feature_grid_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_split_content_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_split_content_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_split_content_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_link_grid_items_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_link_grid_items_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_link_grid_items_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_link_grid_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_link_grid_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_link_grid_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_items_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_call_to_action_action_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_call_to_action_action_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_call_to_action_action_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_call_to_action_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_logo_cloud_items_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_contact_form_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_contact_form_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_footer_navigation_items_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_footer_navigation_newsletter_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_footer_navigation_newsletter_icon_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_cms_footer_navigation_contact_form_icon" AS ENUM('arrow-right', 'book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  CREATE TYPE "public"."enum_cms_footer_navigation_contact_form_icon_position" AS ENUM('left', 'right');
  ALTER TYPE "public"."enum_cms_header_navigation_items_icon" ADD VALUE 'arrow-right' BEFORE 'book-open';
  ALTER TYPE "public"."enum_cms_header_navigation_search_icon" ADD VALUE 'arrow-right' BEFORE 'book-open';
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "primary_button_type" "enum_cms_pages_blocks_hero_primary_button_type" DEFAULT 'page';
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "primary_button_page_id" integer;
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "primary_button_post_id" integer;
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "primary_button_new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "primary_button_icon" "enum_cms_pages_blocks_hero_primary_button_icon";
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "primary_button_icon_position" "enum_cms_pages_blocks_hero_primary_button_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "secondary_button_type" "enum_cms_pages_blocks_hero_secondary_button_type" DEFAULT 'page';
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "secondary_button_page_id" integer;
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "secondary_button_post_id" integer;
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "secondary_button_new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "secondary_button_icon" "enum_cms_pages_blocks_hero_secondary_button_icon";
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "secondary_button_icon_position" "enum_cms_pages_blocks_hero_secondary_button_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_type" "enum_cms_pages_blocks_feature_grid_action_type" DEFAULT 'page';
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_icon" "enum_cms_pages_blocks_feature_grid_action_icon";
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_icon_position" "enum_cms_pages_blocks_feature_grid_action_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_type" "enum_cms_pages_blocks_split_content_action_type" DEFAULT 'page';
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_icon" "enum_cms_pages_blocks_split_content_action_icon";
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_icon_position" "enum_cms_pages_blocks_split_content_action_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD COLUMN "type" "enum_cms_pages_blocks_link_grid_items_type" DEFAULT 'url';
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD COLUMN "icon" "enum_cms_pages_blocks_link_grid_items_icon";
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD COLUMN "icon_position" "enum_cms_pages_blocks_link_grid_items_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_type" "enum_cms_pages_blocks_link_grid_action_type" DEFAULT 'page';
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_icon" "enum_cms_pages_blocks_link_grid_action_icon";
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_icon_position" "enum_cms_pages_blocks_link_grid_action_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" ADD COLUMN "type" "enum_cms_pages_blocks_portfolio_grid_items_type" DEFAULT 'url';
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_type" "enum_cms_pages_blocks_portfolio_grid_action_type" DEFAULT 'page';
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_icon" "enum_cms_pages_blocks_portfolio_grid_action_icon";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_icon_position" "enum_cms_pages_blocks_portfolio_grid_action_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_label" varchar;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_type" "enum_cms_pages_blocks_call_to_action_action_type" DEFAULT 'page';
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_url" varchar;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_icon" "enum_cms_pages_blocks_call_to_action_action_icon";
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_icon_position" "enum_cms_pages_blocks_call_to_action_action_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "action_variant" "enum_cms_pages_blocks_call_to_action_action_variant" DEFAULT 'primary-filled';
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD COLUMN "type" "enum_cms_pages_blocks_logo_cloud_items_type" DEFAULT 'url';
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_contact_form" ADD COLUMN "icon" "enum_cms_pages_blocks_contact_form_icon";
  ALTER TABLE "cms_pages_blocks_contact_form" ADD COLUMN "icon_position" "enum_cms_pages_blocks_contact_form_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "primary_button_type" "enum__cms_pages_v_blocks_hero_primary_button_type" DEFAULT 'page';
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "primary_button_page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "primary_button_post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "primary_button_new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "primary_button_icon" "enum__cms_pages_v_blocks_hero_primary_button_icon";
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "primary_button_icon_position" "enum__cms_pages_v_blocks_hero_primary_button_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "secondary_button_type" "enum__cms_pages_v_blocks_hero_secondary_button_type" DEFAULT 'page';
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "secondary_button_page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "secondary_button_post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "secondary_button_new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "secondary_button_icon" "enum__cms_pages_v_blocks_hero_secondary_button_icon";
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "secondary_button_icon_position" "enum__cms_pages_v_blocks_hero_secondary_button_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_type" "enum__cms_pages_v_blocks_feature_grid_action_type" DEFAULT 'page';
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_icon" "enum__cms_pages_v_blocks_feature_grid_action_icon";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_icon_position" "enum__cms_pages_v_blocks_feature_grid_action_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_type" "enum__cms_pages_v_blocks_split_content_action_type" DEFAULT 'page';
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_icon" "enum__cms_pages_v_blocks_split_content_action_icon";
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_icon_position" "enum__cms_pages_v_blocks_split_content_action_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD COLUMN "type" "enum__cms_pages_v_blocks_link_grid_items_type" DEFAULT 'url';
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD COLUMN "icon" "enum__cms_pages_v_blocks_link_grid_items_icon";
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD COLUMN "icon_position" "enum__cms_pages_v_blocks_link_grid_items_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_type" "enum__cms_pages_v_blocks_link_grid_action_type" DEFAULT 'page';
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_icon" "enum__cms_pages_v_blocks_link_grid_action_icon";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_icon_position" "enum__cms_pages_v_blocks_link_grid_action_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" ADD COLUMN "type" "enum__cms_pages_v_blocks_portfolio_grid_items_type" DEFAULT 'url';
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_type" "enum__cms_pages_v_blocks_portfolio_grid_action_type" DEFAULT 'page';
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_icon" "enum__cms_pages_v_blocks_portfolio_grid_action_icon";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_icon_position" "enum__cms_pages_v_blocks_portfolio_grid_action_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_label" varchar;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_type" "enum__cms_pages_v_blocks_call_to_action_action_type" DEFAULT 'page';
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_url" varchar;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_icon" "enum__cms_pages_v_blocks_call_to_action_action_icon";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_icon_position" "enum__cms_pages_v_blocks_call_to_action_action_icon_position" DEFAULT 'right';
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "action_variant" "enum__cms_pages_v_blocks_call_to_action_action_variant" DEFAULT 'primary-filled';
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD COLUMN "type" "enum__cms_pages_v_blocks_logo_cloud_items_type" DEFAULT 'url';
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD COLUMN "post_id" integer;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD COLUMN "new_tab" boolean DEFAULT false;
  ALTER TABLE "_cms_pages_v_blocks_contact_form" ADD COLUMN "icon" "enum__cms_pages_v_blocks_contact_form_icon";
  ALTER TABLE "_cms_pages_v_blocks_contact_form" ADD COLUMN "icon_position" "enum__cms_pages_v_blocks_contact_form_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_footer_navigation_items" ADD COLUMN "icon" "enum_cms_footer_navigation_items_icon";
  ALTER TABLE "cms_footer_navigation_items" ADD COLUMN "icon_only" boolean DEFAULT false;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_icon" "enum_cms_footer_navigation_newsletter_icon";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "newsletter_icon_position" "enum_cms_footer_navigation_newsletter_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_icon" "enum_cms_footer_navigation_contact_form_icon";
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "contact_form_icon_position" "enum_cms_footer_navigation_contact_form_icon_position" DEFAULT 'right';
  ALTER TABLE "cms_pages_blocks_hero" ADD CONSTRAINT "cms_pages_blocks_hero_primary_button_page_id_cms_pages_id_fk" FOREIGN KEY ("primary_button_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_hero" ADD CONSTRAINT "cms_pages_blocks_hero_primary_button_post_id_cms_posts_id_fk" FOREIGN KEY ("primary_button_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_hero" ADD CONSTRAINT "cms_pages_blocks_hero_secondary_button_page_id_cms_pages_id_fk" FOREIGN KEY ("secondary_button_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_hero" ADD CONSTRAINT "cms_pages_blocks_hero_secondary_button_post_id_cms_posts_id_fk" FOREIGN KEY ("secondary_button_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD CONSTRAINT "cms_pages_blocks_feature_grid_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD CONSTRAINT "cms_pages_blocks_feature_grid_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_split_content" ADD CONSTRAINT "cms_pages_blocks_split_content_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_split_content" ADD CONSTRAINT "cms_pages_blocks_split_content_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD CONSTRAINT "cms_pages_blocks_link_grid_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD CONSTRAINT "cms_pages_blocks_link_grid_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_link_grid" ADD CONSTRAINT "cms_pages_blocks_link_grid_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_link_grid" ADD CONSTRAINT "cms_pages_blocks_link_grid_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" ADD CONSTRAINT "cms_pages_blocks_portfolio_grid_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" ADD CONSTRAINT "cms_pages_blocks_portfolio_grid_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD CONSTRAINT "cms_pages_blocks_portfolio_grid_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD CONSTRAINT "cms_pages_blocks_portfolio_grid_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD CONSTRAINT "cms_pages_blocks_call_to_action_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD CONSTRAINT "cms_pages_blocks_call_to_action_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD CONSTRAINT "cms_pages_blocks_logo_cloud_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD CONSTRAINT "cms_pages_blocks_logo_cloud_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD CONSTRAINT "_cms_pages_v_blocks_hero_primary_button_page_id_cms_pages_id_fk" FOREIGN KEY ("primary_button_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD CONSTRAINT "_cms_pages_v_blocks_hero_primary_button_post_id_cms_posts_id_fk" FOREIGN KEY ("primary_button_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD CONSTRAINT "_cms_pages_v_blocks_hero_secondary_button_page_id_cms_pages_id_fk" FOREIGN KEY ("secondary_button_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD CONSTRAINT "_cms_pages_v_blocks_hero_secondary_button_post_id_cms_posts_id_fk" FOREIGN KEY ("secondary_button_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD CONSTRAINT "_cms_pages_v_blocks_feature_grid_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD CONSTRAINT "_cms_pages_v_blocks_feature_grid_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD CONSTRAINT "_cms_pages_v_blocks_split_content_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD CONSTRAINT "_cms_pages_v_blocks_split_content_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD CONSTRAINT "_cms_pages_v_blocks_link_grid_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD CONSTRAINT "_cms_pages_v_blocks_link_grid_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD CONSTRAINT "_cms_pages_v_blocks_link_grid_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD CONSTRAINT "_cms_pages_v_blocks_link_grid_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" ADD CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" ADD CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD CONSTRAINT "_cms_pages_v_blocks_call_to_action_action_page_id_cms_pages_id_fk" FOREIGN KEY ("action_page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD CONSTRAINT "_cms_pages_v_blocks_call_to_action_action_post_id_cms_posts_id_fk" FOREIGN KEY ("action_post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_cms_pages_v_blocks_logo_cloud_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_cms_pages_v_blocks_logo_cloud_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cms_pages_blocks_hero_primary_button_primary_button_page_idx" ON "cms_pages_blocks_hero" USING btree ("primary_button_page_id");
  CREATE INDEX "cms_pages_blocks_hero_primary_button_primary_button_post_idx" ON "cms_pages_blocks_hero" USING btree ("primary_button_post_id");
  CREATE INDEX "cms_pages_blocks_hero_secondary_button_secondary_button__idx" ON "cms_pages_blocks_hero" USING btree ("secondary_button_page_id");
  CREATE INDEX "cms_pages_blocks_hero_secondary_button_secondary_butto_1_idx" ON "cms_pages_blocks_hero" USING btree ("secondary_button_post_id");
  CREATE INDEX "cms_pages_blocks_feature_grid_action_action_page_idx" ON "cms_pages_blocks_feature_grid" USING btree ("action_page_id");
  CREATE INDEX "cms_pages_blocks_feature_grid_action_action_post_idx" ON "cms_pages_blocks_feature_grid" USING btree ("action_post_id");
  CREATE INDEX "cms_pages_blocks_split_content_action_action_page_idx" ON "cms_pages_blocks_split_content" USING btree ("action_page_id");
  CREATE INDEX "cms_pages_blocks_split_content_action_action_post_idx" ON "cms_pages_blocks_split_content" USING btree ("action_post_id");
  CREATE INDEX "cms_pages_blocks_link_grid_items_page_idx" ON "cms_pages_blocks_link_grid_items" USING btree ("page_id");
  CREATE INDEX "cms_pages_blocks_link_grid_items_post_idx" ON "cms_pages_blocks_link_grid_items" USING btree ("post_id");
  CREATE INDEX "cms_pages_blocks_link_grid_action_action_page_idx" ON "cms_pages_blocks_link_grid" USING btree ("action_page_id");
  CREATE INDEX "cms_pages_blocks_link_grid_action_action_post_idx" ON "cms_pages_blocks_link_grid" USING btree ("action_post_id");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_items_page_idx" ON "cms_pages_blocks_portfolio_grid_items" USING btree ("page_id");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_items_post_idx" ON "cms_pages_blocks_portfolio_grid_items" USING btree ("post_id");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_action_action_page_idx" ON "cms_pages_blocks_portfolio_grid" USING btree ("action_page_id");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_action_action_post_idx" ON "cms_pages_blocks_portfolio_grid" USING btree ("action_post_id");
  CREATE INDEX "cms_pages_blocks_call_to_action_action_action_page_idx" ON "cms_pages_blocks_call_to_action" USING btree ("action_page_id");
  CREATE INDEX "cms_pages_blocks_call_to_action_action_action_post_idx" ON "cms_pages_blocks_call_to_action" USING btree ("action_post_id");
  CREATE INDEX "cms_pages_blocks_logo_cloud_items_page_idx" ON "cms_pages_blocks_logo_cloud_items" USING btree ("page_id");
  CREATE INDEX "cms_pages_blocks_logo_cloud_items_post_idx" ON "cms_pages_blocks_logo_cloud_items" USING btree ("post_id");
  CREATE INDEX "_cms_pages_v_blocks_hero_primary_button_primary_button_p_idx" ON "_cms_pages_v_blocks_hero" USING btree ("primary_button_page_id");
  CREATE INDEX "_cms_pages_v_blocks_hero_primary_button_primary_button_1_idx" ON "_cms_pages_v_blocks_hero" USING btree ("primary_button_post_id");
  CREATE INDEX "_cms_pages_v_blocks_hero_secondary_button_secondary_butt_idx" ON "_cms_pages_v_blocks_hero" USING btree ("secondary_button_page_id");
  CREATE INDEX "_cms_pages_v_blocks_hero_secondary_button_secondary_bu_1_idx" ON "_cms_pages_v_blocks_hero" USING btree ("secondary_button_post_id");
  CREATE INDEX "_cms_pages_v_blocks_feature_grid_action_action_page_idx" ON "_cms_pages_v_blocks_feature_grid" USING btree ("action_page_id");
  CREATE INDEX "_cms_pages_v_blocks_feature_grid_action_action_post_idx" ON "_cms_pages_v_blocks_feature_grid" USING btree ("action_post_id");
  CREATE INDEX "_cms_pages_v_blocks_split_content_action_action_page_idx" ON "_cms_pages_v_blocks_split_content" USING btree ("action_page_id");
  CREATE INDEX "_cms_pages_v_blocks_split_content_action_action_post_idx" ON "_cms_pages_v_blocks_split_content" USING btree ("action_post_id");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_items_page_idx" ON "_cms_pages_v_blocks_link_grid_items" USING btree ("page_id");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_items_post_idx" ON "_cms_pages_v_blocks_link_grid_items" USING btree ("post_id");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_action_action_page_idx" ON "_cms_pages_v_blocks_link_grid" USING btree ("action_page_id");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_action_action_post_idx" ON "_cms_pages_v_blocks_link_grid" USING btree ("action_post_id");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_items_page_idx" ON "_cms_pages_v_blocks_portfolio_grid_items" USING btree ("page_id");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_items_post_idx" ON "_cms_pages_v_blocks_portfolio_grid_items" USING btree ("post_id");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_action_action_page_idx" ON "_cms_pages_v_blocks_portfolio_grid" USING btree ("action_page_id");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_action_action_post_idx" ON "_cms_pages_v_blocks_portfolio_grid" USING btree ("action_post_id");
  CREATE INDEX "_cms_pages_v_blocks_call_to_action_action_action_page_idx" ON "_cms_pages_v_blocks_call_to_action" USING btree ("action_page_id");
  CREATE INDEX "_cms_pages_v_blocks_call_to_action_action_action_post_idx" ON "_cms_pages_v_blocks_call_to_action" USING btree ("action_post_id");
  CREATE INDEX "_cms_pages_v_blocks_logo_cloud_items_page_idx" ON "_cms_pages_v_blocks_logo_cloud_items" USING btree ("page_id");
  CREATE INDEX "_cms_pages_v_blocks_logo_cloud_items_post_idx" ON "_cms_pages_v_blocks_logo_cloud_items" USING btree ("post_id");
  UPDATE "cms_pages_blocks_hero" SET "primary_button_type" = 'url' WHERE "primary_button_url" IS NOT NULL;
  UPDATE "cms_pages_blocks_hero" SET "secondary_button_type" = 'url' WHERE "secondary_button_url" IS NOT NULL;
  UPDATE "cms_pages_blocks_feature_grid" SET "action_type" = 'url', "action_icon" = 'arrow-right', "action_icon_position" = 'right' WHERE "action_url" IS NOT NULL;
  UPDATE "cms_pages_blocks_split_content" SET "action_type" = 'url', "action_icon" = 'arrow-right', "action_icon_position" = 'right' WHERE "action_url" IS NOT NULL;
  UPDATE "cms_pages_blocks_link_grid" SET "action_type" = 'url', "action_icon" = 'arrow-right', "action_icon_position" = 'right' WHERE "action_url" IS NOT NULL;
  UPDATE "cms_pages_blocks_portfolio_grid" SET "action_type" = 'url', "action_icon" = 'arrow-right', "action_icon_position" = 'right' WHERE "action_url" IS NOT NULL;
  UPDATE "cms_pages_blocks_link_grid_items" SET "type" = 'url', "new_tab" = true WHERE "url" IS NOT NULL;
  UPDATE "cms_pages_blocks_portfolio_grid_items" SET "type" = 'url', "new_tab" = true WHERE "url" IS NOT NULL;
  UPDATE "cms_pages_blocks_logo_cloud_items" SET "type" = 'url', "new_tab" = true WHERE "url" IS NOT NULL;
  UPDATE "cms_pages_blocks_call_to_action" SET
    "action_label" = "button_label",
    "action_type" = 'url',
    "action_url" = "button_url",
    "action_variant" = "button_variant"::text::"enum_cms_pages_blocks_call_to_action_action_variant"
  WHERE "button_label" IS NOT NULL OR "button_url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_hero" SET "primary_button_type" = 'url' WHERE "primary_button_url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_hero" SET "secondary_button_type" = 'url' WHERE "secondary_button_url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_feature_grid" SET "action_type" = 'url', "action_icon" = 'arrow-right', "action_icon_position" = 'right' WHERE "action_url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_split_content" SET "action_type" = 'url', "action_icon" = 'arrow-right', "action_icon_position" = 'right' WHERE "action_url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_link_grid" SET "action_type" = 'url', "action_icon" = 'arrow-right', "action_icon_position" = 'right' WHERE "action_url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_portfolio_grid" SET "action_type" = 'url', "action_icon" = 'arrow-right', "action_icon_position" = 'right' WHERE "action_url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_link_grid_items" SET "type" = 'url', "new_tab" = true WHERE "url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_portfolio_grid_items" SET "type" = 'url', "new_tab" = true WHERE "url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_logo_cloud_items" SET "type" = 'url', "new_tab" = true WHERE "url" IS NOT NULL;
  UPDATE "_cms_pages_v_blocks_call_to_action" SET
    "action_label" = "button_label",
    "action_type" = 'url',
    "action_url" = "button_url",
    "action_variant" = "button_variant"::text::"enum__cms_pages_v_blocks_call_to_action_action_variant"
  WHERE "button_label" IS NOT NULL OR "button_url" IS NOT NULL;
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "button_label";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "button_url";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "button_variant";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "button_label";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "button_url";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "button_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_call_to_action_button_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_call_to_action_button_variant";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_pages_blocks_call_to_action_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_call_to_action_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  ALTER TABLE "cms_pages_blocks_hero" DROP CONSTRAINT "cms_pages_blocks_hero_primary_button_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_hero" DROP CONSTRAINT "cms_pages_blocks_hero_primary_button_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_hero" DROP CONSTRAINT "cms_pages_blocks_hero_secondary_button_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_hero" DROP CONSTRAINT "cms_pages_blocks_hero_secondary_button_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP CONSTRAINT "cms_pages_blocks_feature_grid_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP CONSTRAINT "cms_pages_blocks_feature_grid_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_split_content" DROP CONSTRAINT "cms_pages_blocks_split_content_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_split_content" DROP CONSTRAINT "cms_pages_blocks_split_content_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_link_grid_items" DROP CONSTRAINT "cms_pages_blocks_link_grid_items_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_link_grid_items" DROP CONSTRAINT "cms_pages_blocks_link_grid_items_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_link_grid" DROP CONSTRAINT "cms_pages_blocks_link_grid_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_link_grid" DROP CONSTRAINT "cms_pages_blocks_link_grid_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" DROP CONSTRAINT "cms_pages_blocks_portfolio_grid_items_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" DROP CONSTRAINT "cms_pages_blocks_portfolio_grid_items_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP CONSTRAINT "cms_pages_blocks_portfolio_grid_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP CONSTRAINT "cms_pages_blocks_portfolio_grid_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP CONSTRAINT "cms_pages_blocks_call_to_action_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP CONSTRAINT "cms_pages_blocks_call_to_action_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" DROP CONSTRAINT "cms_pages_blocks_logo_cloud_items_page_id_cms_pages_id_fk";
  
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" DROP CONSTRAINT "cms_pages_blocks_logo_cloud_items_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP CONSTRAINT "_cms_pages_v_blocks_hero_primary_button_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP CONSTRAINT "_cms_pages_v_blocks_hero_primary_button_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP CONSTRAINT "_cms_pages_v_blocks_hero_secondary_button_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP CONSTRAINT "_cms_pages_v_blocks_hero_secondary_button_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP CONSTRAINT "_cms_pages_v_blocks_feature_grid_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP CONSTRAINT "_cms_pages_v_blocks_feature_grid_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP CONSTRAINT "_cms_pages_v_blocks_split_content_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP CONSTRAINT "_cms_pages_v_blocks_split_content_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DROP CONSTRAINT "_cms_pages_v_blocks_link_grid_items_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DROP CONSTRAINT "_cms_pages_v_blocks_link_grid_items_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP CONSTRAINT "_cms_pages_v_blocks_link_grid_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP CONSTRAINT "_cms_pages_v_blocks_link_grid_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" DROP CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_items_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" DROP CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_items_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP CONSTRAINT "_cms_pages_v_blocks_call_to_action_action_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP CONSTRAINT "_cms_pages_v_blocks_call_to_action_action_post_id_cms_posts_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" DROP CONSTRAINT "_cms_pages_v_blocks_logo_cloud_items_page_id_cms_pages_id_fk";
  
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" DROP CONSTRAINT "_cms_pages_v_blocks_logo_cloud_items_post_id_cms_posts_id_fk";
  
  ALTER TABLE "cms_header_navigation_items" ALTER COLUMN "icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_cms_header_navigation_items_icon";
  CREATE TYPE "public"."enum_cms_header_navigation_items_icon" AS ENUM('book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  ALTER TABLE "cms_header_navigation_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_cms_header_navigation_items_icon" USING "icon"::"public"."enum_cms_header_navigation_items_icon";
  ALTER TABLE "cms_header_navigation" ALTER COLUMN "search_icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_cms_header_navigation_search_icon";
  CREATE TYPE "public"."enum_cms_header_navigation_search_icon" AS ENUM('book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube', 'twitter');
  ALTER TABLE "cms_header_navigation" ALTER COLUMN "search_icon" SET DATA TYPE "public"."enum_cms_header_navigation_search_icon" USING "search_icon"::"public"."enum_cms_header_navigation_search_icon";
  DROP INDEX "cms_pages_blocks_hero_primary_button_primary_button_page_idx";
  DROP INDEX "cms_pages_blocks_hero_primary_button_primary_button_post_idx";
  DROP INDEX "cms_pages_blocks_hero_secondary_button_secondary_button__idx";
  DROP INDEX "cms_pages_blocks_hero_secondary_button_secondary_butto_1_idx";
  DROP INDEX "cms_pages_blocks_feature_grid_action_action_page_idx";
  DROP INDEX "cms_pages_blocks_feature_grid_action_action_post_idx";
  DROP INDEX "cms_pages_blocks_split_content_action_action_page_idx";
  DROP INDEX "cms_pages_blocks_split_content_action_action_post_idx";
  DROP INDEX "cms_pages_blocks_link_grid_items_page_idx";
  DROP INDEX "cms_pages_blocks_link_grid_items_post_idx";
  DROP INDEX "cms_pages_blocks_link_grid_action_action_page_idx";
  DROP INDEX "cms_pages_blocks_link_grid_action_action_post_idx";
  DROP INDEX "cms_pages_blocks_portfolio_grid_items_page_idx";
  DROP INDEX "cms_pages_blocks_portfolio_grid_items_post_idx";
  DROP INDEX "cms_pages_blocks_portfolio_grid_action_action_page_idx";
  DROP INDEX "cms_pages_blocks_portfolio_grid_action_action_post_idx";
  DROP INDEX "cms_pages_blocks_call_to_action_action_action_page_idx";
  DROP INDEX "cms_pages_blocks_call_to_action_action_action_post_idx";
  DROP INDEX "cms_pages_blocks_logo_cloud_items_page_idx";
  DROP INDEX "cms_pages_blocks_logo_cloud_items_post_idx";
  DROP INDEX "_cms_pages_v_blocks_hero_primary_button_primary_button_p_idx";
  DROP INDEX "_cms_pages_v_blocks_hero_primary_button_primary_button_1_idx";
  DROP INDEX "_cms_pages_v_blocks_hero_secondary_button_secondary_butt_idx";
  DROP INDEX "_cms_pages_v_blocks_hero_secondary_button_secondary_bu_1_idx";
  DROP INDEX "_cms_pages_v_blocks_feature_grid_action_action_page_idx";
  DROP INDEX "_cms_pages_v_blocks_feature_grid_action_action_post_idx";
  DROP INDEX "_cms_pages_v_blocks_split_content_action_action_page_idx";
  DROP INDEX "_cms_pages_v_blocks_split_content_action_action_post_idx";
  DROP INDEX "_cms_pages_v_blocks_link_grid_items_page_idx";
  DROP INDEX "_cms_pages_v_blocks_link_grid_items_post_idx";
  DROP INDEX "_cms_pages_v_blocks_link_grid_action_action_page_idx";
  DROP INDEX "_cms_pages_v_blocks_link_grid_action_action_post_idx";
  DROP INDEX "_cms_pages_v_blocks_portfolio_grid_items_page_idx";
  DROP INDEX "_cms_pages_v_blocks_portfolio_grid_items_post_idx";
  DROP INDEX "_cms_pages_v_blocks_portfolio_grid_action_action_page_idx";
  DROP INDEX "_cms_pages_v_blocks_portfolio_grid_action_action_post_idx";
  DROP INDEX "_cms_pages_v_blocks_call_to_action_action_action_page_idx";
  DROP INDEX "_cms_pages_v_blocks_call_to_action_action_action_post_idx";
  DROP INDEX "_cms_pages_v_blocks_logo_cloud_items_page_idx";
  DROP INDEX "_cms_pages_v_blocks_logo_cloud_items_post_idx";
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "button_label" varchar;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "button_url" varchar;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "button_variant" "enum_cms_pages_blocks_call_to_action_button_variant" DEFAULT 'primary-filled';
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "button_label" varchar;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "button_url" varchar;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "button_variant" "enum__cms_pages_v_blocks_call_to_action_button_variant" DEFAULT 'primary-filled';
  UPDATE "cms_pages_blocks_call_to_action" SET
    "button_label" = "action_label",
    "button_url" = "action_url",
    "button_variant" = "action_variant"::text::"enum_cms_pages_blocks_call_to_action_button_variant";
  UPDATE "_cms_pages_v_blocks_call_to_action" SET
    "button_label" = "action_label",
    "button_url" = "action_url",
    "button_variant" = "action_variant"::text::"enum__cms_pages_v_blocks_call_to_action_button_variant";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "primary_button_type";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "primary_button_page_id";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "primary_button_post_id";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "primary_button_new_tab";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "primary_button_icon";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "primary_button_icon_position";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "secondary_button_type";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "secondary_button_page_id";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "secondary_button_post_id";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "secondary_button_new_tab";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "secondary_button_icon";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "secondary_button_icon_position";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_type";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_page_id";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_post_id";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_new_tab";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_icon";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_icon_position";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_type";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_page_id";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_post_id";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_new_tab";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_icon";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_icon_position";
  ALTER TABLE "cms_pages_blocks_link_grid_items" DROP COLUMN "type";
  ALTER TABLE "cms_pages_blocks_link_grid_items" DROP COLUMN "page_id";
  ALTER TABLE "cms_pages_blocks_link_grid_items" DROP COLUMN "post_id";
  ALTER TABLE "cms_pages_blocks_link_grid_items" DROP COLUMN "new_tab";
  ALTER TABLE "cms_pages_blocks_link_grid_items" DROP COLUMN "icon";
  ALTER TABLE "cms_pages_blocks_link_grid_items" DROP COLUMN "icon_position";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_type";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_page_id";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_post_id";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_new_tab";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_icon";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_icon_position";
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" DROP COLUMN "type";
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" DROP COLUMN "page_id";
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" DROP COLUMN "post_id";
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" DROP COLUMN "new_tab";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_type";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_page_id";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_post_id";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_new_tab";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_icon";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_icon_position";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_label";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_type";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_page_id";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_post_id";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_url";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_new_tab";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_icon";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_icon_position";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "action_variant";
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" DROP COLUMN "type";
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" DROP COLUMN "page_id";
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" DROP COLUMN "post_id";
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" DROP COLUMN "new_tab";
  ALTER TABLE "cms_pages_blocks_contact_form" DROP COLUMN "icon";
  ALTER TABLE "cms_pages_blocks_contact_form" DROP COLUMN "icon_position";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "primary_button_type";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "primary_button_page_id";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "primary_button_post_id";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "primary_button_new_tab";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "primary_button_icon";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "primary_button_icon_position";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "secondary_button_type";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "secondary_button_page_id";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "secondary_button_post_id";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "secondary_button_new_tab";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "secondary_button_icon";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "secondary_button_icon_position";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_type";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_page_id";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_post_id";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_new_tab";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_icon";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_icon_position";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_type";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_page_id";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_post_id";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_new_tab";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_icon";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_icon_position";
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DROP COLUMN "type";
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DROP COLUMN "page_id";
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DROP COLUMN "post_id";
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DROP COLUMN "new_tab";
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DROP COLUMN "icon";
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DROP COLUMN "icon_position";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_type";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_page_id";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_post_id";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_new_tab";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_icon";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_icon_position";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" DROP COLUMN "type";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" DROP COLUMN "page_id";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" DROP COLUMN "post_id";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" DROP COLUMN "new_tab";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_type";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_page_id";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_post_id";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_new_tab";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_icon";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_icon_position";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_label";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_type";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_page_id";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_post_id";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_url";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_new_tab";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_icon";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_icon_position";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "action_variant";
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" DROP COLUMN "type";
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" DROP COLUMN "page_id";
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" DROP COLUMN "post_id";
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" DROP COLUMN "new_tab";
  ALTER TABLE "_cms_pages_v_blocks_contact_form" DROP COLUMN "icon";
  ALTER TABLE "_cms_pages_v_blocks_contact_form" DROP COLUMN "icon_position";
  ALTER TABLE "cms_footer_navigation_items" DROP COLUMN "icon";
  ALTER TABLE "cms_footer_navigation_items" DROP COLUMN "icon_only";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_icon";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "newsletter_icon_position";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_icon";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "contact_form_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_primary_button_type";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_primary_button_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_primary_button_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_secondary_button_type";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_secondary_button_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_secondary_button_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_feature_grid_action_type";
  DROP TYPE "public"."enum_cms_pages_blocks_feature_grid_action_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_feature_grid_action_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_split_content_action_type";
  DROP TYPE "public"."enum_cms_pages_blocks_split_content_action_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_split_content_action_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_link_grid_items_type";
  DROP TYPE "public"."enum_cms_pages_blocks_link_grid_items_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_link_grid_items_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_link_grid_action_type";
  DROP TYPE "public"."enum_cms_pages_blocks_link_grid_action_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_link_grid_action_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_portfolio_grid_items_type";
  DROP TYPE "public"."enum_cms_pages_blocks_portfolio_grid_action_type";
  DROP TYPE "public"."enum_cms_pages_blocks_portfolio_grid_action_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_portfolio_grid_action_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_call_to_action_action_type";
  DROP TYPE "public"."enum_cms_pages_blocks_call_to_action_action_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_call_to_action_action_icon_position";
  DROP TYPE "public"."enum_cms_pages_blocks_call_to_action_action_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_logo_cloud_items_type";
  DROP TYPE "public"."enum_cms_pages_blocks_contact_form_icon";
  DROP TYPE "public"."enum_cms_pages_blocks_contact_form_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_primary_button_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_primary_button_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_primary_button_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_secondary_button_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_secondary_button_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_secondary_button_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_feature_grid_action_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_feature_grid_action_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_feature_grid_action_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_split_content_action_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_split_content_action_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_split_content_action_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_link_grid_items_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_link_grid_items_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_link_grid_items_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_link_grid_action_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_link_grid_action_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_link_grid_action_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_items_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_action_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_action_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_action_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_call_to_action_action_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_call_to_action_action_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_call_to_action_action_icon_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_call_to_action_action_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_logo_cloud_items_type";
  DROP TYPE "public"."enum__cms_pages_v_blocks_contact_form_icon";
  DROP TYPE "public"."enum__cms_pages_v_blocks_contact_form_icon_position";
  DROP TYPE "public"."enum_cms_footer_navigation_items_icon";
  DROP TYPE "public"."enum_cms_footer_navigation_newsletter_icon";
  DROP TYPE "public"."enum_cms_footer_navigation_newsletter_icon_position";
  DROP TYPE "public"."enum_cms_footer_navigation_contact_form_icon";
  DROP TYPE "public"."enum_cms_footer_navigation_contact_form_icon_position";`)
}
