import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_pages_blocks_hero_primary_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_pages_blocks_hero_secondary_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_pages_blocks_feature_grid_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_pages_blocks_split_content_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_pages_blocks_link_grid_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_pages_blocks_portfolio_grid_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_pages_blocks_call_to_action_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_primary_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_secondary_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_feature_grid_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_split_content_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_link_grid_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_action_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_call_to_action_button_variant" AS ENUM('primary-filled', 'primary-outline', 'secondary-filled', 'secondary-outline');
  CREATE TYPE "public"."enum_cms_site_settings_buttons_shape" AS ENUM('square', 'soft', 'rounded', 'pill');
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "primary_button_variant" "enum_cms_pages_blocks_hero_primary_button_variant" DEFAULT 'primary-filled';
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "secondary_button_variant" "enum_cms_pages_blocks_hero_secondary_button_variant" DEFAULT 'secondary-outline';
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_variant" "enum_cms_pages_blocks_feature_grid_action_variant" DEFAULT 'primary-outline';
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_variant" "enum_cms_pages_blocks_split_content_action_variant" DEFAULT 'primary-outline';
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_variant" "enum_cms_pages_blocks_link_grid_action_variant" DEFAULT 'primary-outline';
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_variant" "enum_cms_pages_blocks_portfolio_grid_action_variant" DEFAULT 'primary-outline';
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "button_variant" "enum_cms_pages_blocks_call_to_action_button_variant" DEFAULT 'primary-filled';
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "primary_button_variant" "enum__cms_pages_v_blocks_hero_primary_button_variant" DEFAULT 'primary-filled';
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "secondary_button_variant" "enum__cms_pages_v_blocks_hero_secondary_button_variant" DEFAULT 'secondary-outline';
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_variant" "enum__cms_pages_v_blocks_feature_grid_action_variant" DEFAULT 'primary-outline';
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_variant" "enum__cms_pages_v_blocks_split_content_action_variant" DEFAULT 'primary-outline';
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_variant" "enum__cms_pages_v_blocks_link_grid_action_variant" DEFAULT 'primary-outline';
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_variant" "enum__cms_pages_v_blocks_portfolio_grid_action_variant" DEFAULT 'primary-outline';
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "button_variant" "enum__cms_pages_v_blocks_call_to_action_button_variant" DEFAULT 'primary-filled';
  ALTER TABLE "cms_site_settings" ADD COLUMN "buttons_shape" "enum_cms_site_settings_buttons_shape" DEFAULT 'square' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "primary_button_variant";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "secondary_button_variant";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_variant";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_variant";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_variant";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_variant";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "button_variant";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "primary_button_variant";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "secondary_button_variant";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_variant";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_variant";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_variant";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_variant";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "button_variant";
  ALTER TABLE "cms_site_settings" DROP COLUMN "buttons_shape";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_primary_button_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_secondary_button_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_feature_grid_action_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_split_content_action_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_link_grid_action_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_portfolio_grid_action_variant";
  DROP TYPE "public"."enum_cms_pages_blocks_call_to_action_button_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_primary_button_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_secondary_button_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_feature_grid_action_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_split_content_action_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_link_grid_action_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_portfolio_grid_action_variant";
  DROP TYPE "public"."enum__cms_pages_v_blocks_call_to_action_button_variant";
  DROP TYPE "public"."enum_cms_site_settings_buttons_shape";`)
}
