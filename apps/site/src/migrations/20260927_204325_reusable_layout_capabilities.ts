import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_pages_blocks_feature_grid_layout" AS ENUM('cards', 'stacked');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_feature_grid_layout" AS ENUM('cards', 'stacked');
  ALTER TABLE "cms_posts" ADD COLUMN "show_table_of_contents" boolean DEFAULT false;
  ALTER TABLE "_cms_posts_v" ADD COLUMN "version_show_table_of_contents" boolean DEFAULT false;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "layout" "enum_cms_pages_blocks_feature_grid_layout" DEFAULT 'cards';
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_label" varchar;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "action_url" varchar;
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_label" varchar;
  ALTER TABLE "cms_pages_blocks_split_content" ADD COLUMN "action_url" varchar;
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_label" varchar;
  ALTER TABLE "cms_pages_blocks_link_grid" ADD COLUMN "action_url" varchar;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_label" varchar;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD COLUMN "action_url" varchar;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "layout" "enum__cms_pages_v_blocks_feature_grid_layout" DEFAULT 'cards';
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_label" varchar;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "action_url" varchar;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_label" varchar;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD COLUMN "action_url" varchar;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_label" varchar;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD COLUMN "action_url" varchar;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_label" varchar;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD COLUMN "action_url" varchar;
  ALTER TABLE "cms_header_navigation" ADD COLUMN "sticky" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_posts" DROP COLUMN "show_table_of_contents";
  ALTER TABLE "_cms_posts_v" DROP COLUMN "version_show_table_of_contents";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "layout";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_label";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "action_url";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_label";
  ALTER TABLE "cms_pages_blocks_split_content" DROP COLUMN "action_url";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_label";
  ALTER TABLE "cms_pages_blocks_link_grid" DROP COLUMN "action_url";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_label";
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DROP COLUMN "action_url";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "layout";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_label";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "action_url";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_label";
  ALTER TABLE "_cms_pages_v_blocks_split_content" DROP COLUMN "action_url";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_label";
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DROP COLUMN "action_url";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_label";
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DROP COLUMN "action_url";
  ALTER TABLE "cms_header_navigation" DROP COLUMN "sticky";
  DROP TYPE "public"."enum_cms_pages_blocks_feature_grid_layout";
  DROP TYPE "public"."enum__cms_pages_v_blocks_feature_grid_layout";`)
}
