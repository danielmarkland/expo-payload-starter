import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_rich_text" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_rich_text" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "cms_pages_blocks_image" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_image" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "cms_pages_blocks_testimonials" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_testimonials" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "cms_pages_blocks_logo_cloud" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "cms_pages_blocks_stats" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_stats" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "cms_pages_blocks_faq" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_faq" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "cms_pages_blocks_latest_posts" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_latest_posts" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_rich_text" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_rich_text" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_cms_pages_v_blocks_image" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_image" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_cms_pages_v_blocks_testimonials" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_testimonials" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_cms_pages_v_blocks_stats" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_stats" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_cms_pages_v_blocks_faq" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_faq" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_cms_pages_v_blocks_latest_posts" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_latest_posts" ADD COLUMN "eyebrow" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_rich_text" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_rich_text" DROP COLUMN "eyebrow";
  ALTER TABLE "cms_pages_blocks_image" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_image" DROP COLUMN "eyebrow";
  ALTER TABLE "cms_pages_blocks_feature_grid" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_call_to_action" DROP COLUMN "eyebrow";
  ALTER TABLE "cms_pages_blocks_testimonials" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_testimonials" DROP COLUMN "eyebrow";
  ALTER TABLE "cms_pages_blocks_logo_cloud" DROP COLUMN "eyebrow";
  ALTER TABLE "cms_pages_blocks_stats" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_stats" DROP COLUMN "eyebrow";
  ALTER TABLE "cms_pages_blocks_faq" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_faq" DROP COLUMN "eyebrow";
  ALTER TABLE "cms_pages_blocks_latest_posts" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_latest_posts" DROP COLUMN "eyebrow";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_rich_text" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_rich_text" DROP COLUMN "eyebrow";
  ALTER TABLE "_cms_pages_v_blocks_image" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_image" DROP COLUMN "eyebrow";
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DROP COLUMN "eyebrow";
  ALTER TABLE "_cms_pages_v_blocks_testimonials" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_testimonials" DROP COLUMN "eyebrow";
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud" DROP COLUMN "eyebrow";
  ALTER TABLE "_cms_pages_v_blocks_stats" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_stats" DROP COLUMN "eyebrow";
  ALTER TABLE "_cms_pages_v_blocks_faq" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_faq" DROP COLUMN "eyebrow";
  ALTER TABLE "_cms_pages_v_blocks_latest_posts" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_latest_posts" DROP COLUMN "eyebrow";`)
}
