import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__cms_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "cms_pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"primary_button_label" varchar,
  	"primary_button_url" varchar,
  	"secondary_button_label" varchar,
  	"secondary_button_url" varchar,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_feature_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"button_label" varchar,
  	"button_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "cms_pages_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_cms_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_cms_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"primary_button_label" varchar,
  	"primary_button_url" varchar,
  	"secondary_button_label" varchar,
  	"secondary_button_url" varchar,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_feature_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"button_label" varchar,
  	"button_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_logo_cloud_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_logo_cloud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__cms_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "cms_media" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_pages_id" integer;
  ALTER TABLE "cms_pages_blocks_hero" ADD CONSTRAINT "cms_pages_blocks_hero_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_hero" ADD CONSTRAINT "cms_pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_rich_text" ADD CONSTRAINT "cms_pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_image" ADD CONSTRAINT "cms_pages_blocks_image_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_image" ADD CONSTRAINT "cms_pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_feature_grid_items" ADD CONSTRAINT "cms_pages_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_feature_grid" ADD CONSTRAINT "cms_pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_call_to_action" ADD CONSTRAINT "cms_pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_testimonials_items" ADD CONSTRAINT "cms_pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_testimonials" ADD CONSTRAINT "cms_pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD CONSTRAINT "cms_pages_blocks_logo_cloud_items_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD CONSTRAINT "cms_pages_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_logo_cloud" ADD CONSTRAINT "cms_pages_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_stats_items" ADD CONSTRAINT "cms_pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_stats" ADD CONSTRAINT "cms_pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_faq_items" ADD CONSTRAINT "cms_pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_faq" ADD CONSTRAINT "cms_pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD CONSTRAINT "_cms_pages_v_blocks_hero_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD CONSTRAINT "_cms_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_rich_text" ADD CONSTRAINT "_cms_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_image" ADD CONSTRAINT "_cms_pages_v_blocks_image_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_image" ADD CONSTRAINT "_cms_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid_items" ADD CONSTRAINT "_cms_pages_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" ADD CONSTRAINT "_cms_pages_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" ADD CONSTRAINT "_cms_pages_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_cms_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_testimonials" ADD CONSTRAINT "_cms_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_cms_pages_v_blocks_logo_cloud_items_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD CONSTRAINT "_cms_pages_v_blocks_logo_cloud_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v_blocks_logo_cloud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud" ADD CONSTRAINT "_cms_pages_v_blocks_logo_cloud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_stats_items" ADD CONSTRAINT "_cms_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_stats" ADD CONSTRAINT "_cms_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_faq_items" ADD CONSTRAINT "_cms_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_faq" ADD CONSTRAINT "_cms_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v" ADD CONSTRAINT "_cms_pages_v_parent_id_cms_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cms_pages_blocks_hero_order_idx" ON "cms_pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_hero_parent_id_idx" ON "cms_pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_hero_path_idx" ON "cms_pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_hero_image_idx" ON "cms_pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "cms_pages_blocks_rich_text_order_idx" ON "cms_pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_rich_text_parent_id_idx" ON "cms_pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_rich_text_path_idx" ON "cms_pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_image_order_idx" ON "cms_pages_blocks_image" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_image_parent_id_idx" ON "cms_pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_image_path_idx" ON "cms_pages_blocks_image" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_image_image_idx" ON "cms_pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "cms_pages_blocks_feature_grid_items_order_idx" ON "cms_pages_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_feature_grid_items_parent_id_idx" ON "cms_pages_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_feature_grid_order_idx" ON "cms_pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_feature_grid_parent_id_idx" ON "cms_pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_feature_grid_path_idx" ON "cms_pages_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_call_to_action_order_idx" ON "cms_pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_call_to_action_parent_id_idx" ON "cms_pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_call_to_action_path_idx" ON "cms_pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_testimonials_items_order_idx" ON "cms_pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_testimonials_items_parent_id_idx" ON "cms_pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_testimonials_order_idx" ON "cms_pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_testimonials_parent_id_idx" ON "cms_pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_testimonials_path_idx" ON "cms_pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_logo_cloud_items_order_idx" ON "cms_pages_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_logo_cloud_items_parent_id_idx" ON "cms_pages_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_logo_cloud_items_image_idx" ON "cms_pages_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "cms_pages_blocks_logo_cloud_order_idx" ON "cms_pages_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_logo_cloud_parent_id_idx" ON "cms_pages_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_logo_cloud_path_idx" ON "cms_pages_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_stats_items_order_idx" ON "cms_pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_stats_items_parent_id_idx" ON "cms_pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_stats_order_idx" ON "cms_pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_stats_parent_id_idx" ON "cms_pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_stats_path_idx" ON "cms_pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_faq_items_order_idx" ON "cms_pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_faq_items_parent_id_idx" ON "cms_pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_faq_order_idx" ON "cms_pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_faq_parent_id_idx" ON "cms_pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_faq_path_idx" ON "cms_pages_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "cms_pages_slug_idx" ON "cms_pages" USING btree ("slug");
  CREATE INDEX "cms_pages_updated_at_idx" ON "cms_pages" USING btree ("updated_at");
  CREATE INDEX "cms_pages_created_at_idx" ON "cms_pages" USING btree ("created_at");
  CREATE INDEX "cms_pages__status_idx" ON "cms_pages" USING btree ("_status");
  CREATE INDEX "_cms_pages_v_blocks_hero_order_idx" ON "_cms_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_hero_parent_id_idx" ON "_cms_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_hero_path_idx" ON "_cms_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_hero_image_idx" ON "_cms_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_cms_pages_v_blocks_rich_text_order_idx" ON "_cms_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_rich_text_parent_id_idx" ON "_cms_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_rich_text_path_idx" ON "_cms_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_image_order_idx" ON "_cms_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_image_parent_id_idx" ON "_cms_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_image_path_idx" ON "_cms_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_image_image_idx" ON "_cms_pages_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_cms_pages_v_blocks_feature_grid_items_order_idx" ON "_cms_pages_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_feature_grid_items_parent_id_idx" ON "_cms_pages_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_feature_grid_order_idx" ON "_cms_pages_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_feature_grid_parent_id_idx" ON "_cms_pages_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_feature_grid_path_idx" ON "_cms_pages_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_call_to_action_order_idx" ON "_cms_pages_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_call_to_action_parent_id_idx" ON "_cms_pages_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_call_to_action_path_idx" ON "_cms_pages_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_testimonials_items_order_idx" ON "_cms_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_testimonials_items_parent_id_idx" ON "_cms_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_testimonials_order_idx" ON "_cms_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_testimonials_parent_id_idx" ON "_cms_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_testimonials_path_idx" ON "_cms_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_logo_cloud_items_order_idx" ON "_cms_pages_v_blocks_logo_cloud_items" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_logo_cloud_items_parent_id_idx" ON "_cms_pages_v_blocks_logo_cloud_items" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_logo_cloud_items_image_idx" ON "_cms_pages_v_blocks_logo_cloud_items" USING btree ("image_id");
  CREATE INDEX "_cms_pages_v_blocks_logo_cloud_order_idx" ON "_cms_pages_v_blocks_logo_cloud" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_logo_cloud_parent_id_idx" ON "_cms_pages_v_blocks_logo_cloud" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_logo_cloud_path_idx" ON "_cms_pages_v_blocks_logo_cloud" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_stats_items_order_idx" ON "_cms_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_stats_items_parent_id_idx" ON "_cms_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_stats_order_idx" ON "_cms_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_stats_parent_id_idx" ON "_cms_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_stats_path_idx" ON "_cms_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_faq_items_order_idx" ON "_cms_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_faq_items_parent_id_idx" ON "_cms_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_faq_order_idx" ON "_cms_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_faq_parent_id_idx" ON "_cms_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_faq_path_idx" ON "_cms_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_parent_idx" ON "_cms_pages_v" USING btree ("parent_id");
  CREATE INDEX "_cms_pages_v_version_version_slug_idx" ON "_cms_pages_v" USING btree ("version_slug");
  CREATE INDEX "_cms_pages_v_version_version_updated_at_idx" ON "_cms_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_cms_pages_v_version_version_created_at_idx" ON "_cms_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_cms_pages_v_version_version__status_idx" ON "_cms_pages_v" USING btree ("version__status");
  CREATE INDEX "_cms_pages_v_created_at_idx" ON "_cms_pages_v" USING btree ("created_at");
  CREATE INDEX "_cms_pages_v_updated_at_idx" ON "_cms_pages_v" USING btree ("updated_at");
  CREATE INDEX "_cms_pages_v_latest_idx" ON "_cms_pages_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("cms_pages_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_cms_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_call_to_action" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_logo_cloud" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_call_to_action" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cms_pages_blocks_hero" CASCADE;
  DROP TABLE "cms_pages_blocks_rich_text" CASCADE;
  DROP TABLE "cms_pages_blocks_image" CASCADE;
  DROP TABLE "cms_pages_blocks_feature_grid_items" CASCADE;
  DROP TABLE "cms_pages_blocks_feature_grid" CASCADE;
  DROP TABLE "cms_pages_blocks_call_to_action" CASCADE;
  DROP TABLE "cms_pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "cms_pages_blocks_testimonials" CASCADE;
  DROP TABLE "cms_pages_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "cms_pages_blocks_logo_cloud" CASCADE;
  DROP TABLE "cms_pages_blocks_stats_items" CASCADE;
  DROP TABLE "cms_pages_blocks_stats" CASCADE;
  DROP TABLE "cms_pages_blocks_faq_items" CASCADE;
  DROP TABLE "cms_pages_blocks_faq" CASCADE;
  DROP TABLE "cms_pages" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_image" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_call_to_action" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_logo_cloud_items" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_logo_cloud" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_cms_pages_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_cms_pages_id_idx";
  ALTER TABLE "cms_media" DROP COLUMN "_objectkey";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cms_pages_id";
  DROP TYPE "public"."enum_cms_pages_status";
  DROP TYPE "public"."enum__cms_pages_v_version_status";`)
}
