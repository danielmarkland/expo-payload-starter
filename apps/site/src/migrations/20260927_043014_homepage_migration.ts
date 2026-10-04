import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_pages_blocks_split_content_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_split_content_image_position" AS ENUM('left', 'right');
  ALTER TYPE "public"."enum_cms_header_navigation_items_icon" ADD VALUE 'twitter';
  CREATE TABLE "cms_pages_blocks_split_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"image_position" "enum_cms_pages_blocks_split_content_image_position" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_link_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_link_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_portfolio_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"description" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_portfolio_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "cms_pages_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar DEFAULT 'contact',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"submit_label" varchar DEFAULT 'Send message',
  	"success_message" varchar DEFAULT 'Thanks. Your message has been sent.',
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_split_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"image_position" "enum__cms_pages_v_blocks_split_content_image_position" DEFAULT 'right',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_link_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_link_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_portfolio_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"description" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_portfolio_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar DEFAULT 'contact',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"submit_label" varchar DEFAULT 'Send message',
  	"success_message" varchar DEFAULT 'Thanks. Your message has been sent.',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" ADD COLUMN "url" varchar;
  ALTER TABLE "cms_pages_blocks_logo_cloud" ADD COLUMN "anchor" varchar;
  ALTER TABLE "cms_pages_blocks_logo_cloud" ADD COLUMN "intro" varchar;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" ADD COLUMN "url" varchar;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud" ADD COLUMN "anchor" varchar;
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud" ADD COLUMN "intro" varchar;
  ALTER TABLE "cms_site_settings" ADD COLUMN "favicon_id" integer;
  ALTER TABLE "cms_pages_blocks_split_content" ADD CONSTRAINT "cms_pages_blocks_split_content_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_split_content" ADD CONSTRAINT "cms_pages_blocks_split_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_link_grid_items" ADD CONSTRAINT "cms_pages_blocks_link_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages_blocks_link_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_link_grid" ADD CONSTRAINT "cms_pages_blocks_link_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" ADD CONSTRAINT "cms_pages_blocks_portfolio_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages_blocks_portfolio_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" ADD CONSTRAINT "cms_pages_blocks_portfolio_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_pages_blocks_contact_form" ADD CONSTRAINT "cms_pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD CONSTRAINT "_cms_pages_v_blocks_split_content_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_split_content" ADD CONSTRAINT "_cms_pages_v_blocks_split_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" ADD CONSTRAINT "_cms_pages_v_blocks_link_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v_blocks_link_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" ADD CONSTRAINT "_cms_pages_v_blocks_link_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" ADD CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v_blocks_portfolio_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" ADD CONSTRAINT "_cms_pages_v_blocks_portfolio_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_contact_form" ADD CONSTRAINT "_cms_pages_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cms_pages_blocks_split_content_order_idx" ON "cms_pages_blocks_split_content" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_split_content_parent_id_idx" ON "cms_pages_blocks_split_content" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_split_content_path_idx" ON "cms_pages_blocks_split_content" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_split_content_image_idx" ON "cms_pages_blocks_split_content" USING btree ("image_id");
  CREATE INDEX "cms_pages_blocks_link_grid_items_order_idx" ON "cms_pages_blocks_link_grid_items" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_link_grid_items_parent_id_idx" ON "cms_pages_blocks_link_grid_items" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_link_grid_order_idx" ON "cms_pages_blocks_link_grid" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_link_grid_parent_id_idx" ON "cms_pages_blocks_link_grid" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_link_grid_path_idx" ON "cms_pages_blocks_link_grid" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_items_order_idx" ON "cms_pages_blocks_portfolio_grid_items" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_items_parent_id_idx" ON "cms_pages_blocks_portfolio_grid_items" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_order_idx" ON "cms_pages_blocks_portfolio_grid" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_parent_id_idx" ON "cms_pages_blocks_portfolio_grid" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_portfolio_grid_path_idx" ON "cms_pages_blocks_portfolio_grid" USING btree ("_path");
  CREATE INDEX "cms_pages_blocks_contact_form_order_idx" ON "cms_pages_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_contact_form_parent_id_idx" ON "cms_pages_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_contact_form_path_idx" ON "cms_pages_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_split_content_order_idx" ON "_cms_pages_v_blocks_split_content" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_split_content_parent_id_idx" ON "_cms_pages_v_blocks_split_content" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_split_content_path_idx" ON "_cms_pages_v_blocks_split_content" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_split_content_image_idx" ON "_cms_pages_v_blocks_split_content" USING btree ("image_id");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_items_order_idx" ON "_cms_pages_v_blocks_link_grid_items" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_items_parent_id_idx" ON "_cms_pages_v_blocks_link_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_order_idx" ON "_cms_pages_v_blocks_link_grid" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_parent_id_idx" ON "_cms_pages_v_blocks_link_grid" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_link_grid_path_idx" ON "_cms_pages_v_blocks_link_grid" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_items_order_idx" ON "_cms_pages_v_blocks_portfolio_grid_items" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_items_parent_id_idx" ON "_cms_pages_v_blocks_portfolio_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_order_idx" ON "_cms_pages_v_blocks_portfolio_grid" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_parent_id_idx" ON "_cms_pages_v_blocks_portfolio_grid" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_portfolio_grid_path_idx" ON "_cms_pages_v_blocks_portfolio_grid" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_contact_form_order_idx" ON "_cms_pages_v_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_contact_form_parent_id_idx" ON "_cms_pages_v_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_contact_form_path_idx" ON "_cms_pages_v_blocks_contact_form" USING btree ("_path");
  ALTER TABLE "cms_site_settings" ADD CONSTRAINT "cms_site_settings_favicon_id_cms_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cms_site_settings_favicon_idx" ON "cms_site_settings" USING btree ("favicon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_pages_blocks_split_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_link_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_link_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_portfolio_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_portfolio_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_pages_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_split_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_link_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_link_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_portfolio_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_pages_v_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cms_pages_blocks_split_content" CASCADE;
  DROP TABLE "cms_pages_blocks_link_grid_items" CASCADE;
  DROP TABLE "cms_pages_blocks_link_grid" CASCADE;
  DROP TABLE "cms_pages_blocks_portfolio_grid_items" CASCADE;
  DROP TABLE "cms_pages_blocks_portfolio_grid" CASCADE;
  DROP TABLE "cms_pages_blocks_contact_form" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_split_content" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_link_grid_items" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_link_grid" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_portfolio_grid_items" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_portfolio_grid" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_contact_form" CASCADE;
  ALTER TABLE "cms_site_settings" DROP CONSTRAINT "cms_site_settings_favicon_id_cms_media_id_fk";
  
  ALTER TABLE "cms_header_navigation_items" ALTER COLUMN "icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_cms_header_navigation_items_icon";
  CREATE TYPE "public"."enum_cms_header_navigation_items_icon" AS ENUM('book-open', 'external-link', 'github', 'home', 'info', 'linkedin', 'mail', 'search', 'shopping-bag', 'user', 'youtube');
  ALTER TABLE "cms_header_navigation_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_cms_header_navigation_items_icon" USING "icon"::"public"."enum_cms_header_navigation_items_icon";
  DROP INDEX "cms_site_settings_favicon_idx";
  ALTER TABLE "cms_pages_blocks_logo_cloud_items" DROP COLUMN "url";
  ALTER TABLE "cms_pages_blocks_logo_cloud" DROP COLUMN "anchor";
  ALTER TABLE "cms_pages_blocks_logo_cloud" DROP COLUMN "intro";
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud_items" DROP COLUMN "url";
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud" DROP COLUMN "anchor";
  ALTER TABLE "_cms_pages_v_blocks_logo_cloud" DROP COLUMN "intro";
  ALTER TABLE "cms_site_settings" DROP COLUMN "favicon_id";
  DROP TYPE "public"."enum_cms_pages_blocks_split_content_image_position";
  DROP TYPE "public"."enum__cms_pages_v_blocks_split_content_image_position";`)
}
