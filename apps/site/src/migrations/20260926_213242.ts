import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_cms_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_cms_header_navigation_items_type" AS ENUM('page', 'post', 'url');
  CREATE TYPE "public"."enum_cms_footer_navigation_items_type" AS ENUM('page', 'post', 'url');
  CREATE TABLE "cms_authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"bio" varchar,
  	"image_id" integer,
  	"website" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cms_categories_id" integer,
  	"cms_tags_id" integer
  );
  
  CREATE TABLE "_cms_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cms_categories_id" integer,
  	"cms_tags_id" integer
  );
  
  CREATE TABLE "cms_redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_cms_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_cms_redirects_type" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms_redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cms_pages_id" integer,
  	"cms_posts_id" integer
  );
  
  CREATE TABLE "cms_search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"excerpt" varchar,
  	"search_text" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms_search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"cms_pages_id" integer,
  	"cms_posts_id" integer
  );
  
  CREATE TABLE "cms_header_navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_cms_header_navigation_items_type" DEFAULT 'page' NOT NULL,
  	"page_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "cms_header_navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cms_footer_navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_cms_footer_navigation_items_type" DEFAULT 'page' NOT NULL,
  	"page_id" integer,
  	"post_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "cms_footer_navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cms_site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "cms_posts" RENAME COLUMN "seo_title" TO "meta_title";
  ALTER TABLE "cms_posts" RENAME COLUMN "seo_description" TO "meta_description";
  ALTER TABLE "_cms_posts_v" RENAME COLUMN "version_seo_title" TO "version_meta_title";
  ALTER TABLE "_cms_posts_v" RENAME COLUMN "version_seo_description" TO "version_meta_description";
  ALTER TABLE "cms_pages" RENAME COLUMN "seo_title" TO "meta_title";
  ALTER TABLE "cms_pages" RENAME COLUMN "seo_description" TO "meta_description";
  ALTER TABLE "_cms_pages_v" RENAME COLUMN "version_seo_title" TO "version_meta_title";
  ALTER TABLE "_cms_pages_v" RENAME COLUMN "version_seo_description" TO "version_meta_description";
  ALTER TABLE "cms_posts" ADD COLUMN "author_id" integer;
  ALTER TABLE "cms_posts" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "_cms_posts_v" ADD COLUMN "version_author_id" integer;
  ALTER TABLE "_cms_posts_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "cms_pages" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "_cms_pages_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_authors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_redirects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_search_id" integer;
  ALTER TABLE "cms_authors" ADD CONSTRAINT "cms_authors_image_id_cms_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_categories" ADD CONSTRAINT "cms_categories_parent_id_cms_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cms_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_posts_rels" ADD CONSTRAINT "cms_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cms_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_posts_rels" ADD CONSTRAINT "cms_posts_rels_categories_fk" FOREIGN KEY ("cms_categories_id") REFERENCES "public"."cms_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_posts_rels" ADD CONSTRAINT "cms_posts_rels_tags_fk" FOREIGN KEY ("cms_tags_id") REFERENCES "public"."cms_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_posts_v_rels" ADD CONSTRAINT "_cms_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_cms_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_posts_v_rels" ADD CONSTRAINT "_cms_posts_v_rels_categories_fk" FOREIGN KEY ("cms_categories_id") REFERENCES "public"."cms_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_posts_v_rels" ADD CONSTRAINT "_cms_posts_v_rels_tags_fk" FOREIGN KEY ("cms_tags_id") REFERENCES "public"."cms_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_redirects_rels" ADD CONSTRAINT "cms_redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cms_redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_redirects_rels" ADD CONSTRAINT "cms_redirects_rels_pages_fk" FOREIGN KEY ("cms_pages_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_redirects_rels" ADD CONSTRAINT "cms_redirects_rels_posts_fk" FOREIGN KEY ("cms_posts_id") REFERENCES "public"."cms_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_search_rels" ADD CONSTRAINT "cms_search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cms_search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_search_rels" ADD CONSTRAINT "cms_search_rels_pages_fk" FOREIGN KEY ("cms_pages_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_search_rels" ADD CONSTRAINT "cms_search_rels_posts_fk" FOREIGN KEY ("cms_posts_id") REFERENCES "public"."cms_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_header_navigation_items" ADD CONSTRAINT "cms_header_navigation_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_header_navigation_items" ADD CONSTRAINT "cms_header_navigation_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_header_navigation_items" ADD CONSTRAINT "cms_header_navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_header_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_footer_navigation_items" ADD CONSTRAINT "cms_footer_navigation_items_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_footer_navigation_items" ADD CONSTRAINT "cms_footer_navigation_items_post_id_cms_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."cms_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_footer_navigation_items" ADD CONSTRAINT "cms_footer_navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms_site_settings" ADD CONSTRAINT "cms_site_settings_meta_image_id_cms_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "cms_authors_slug_idx" ON "cms_authors" USING btree ("slug");
  CREATE INDEX "cms_authors_image_idx" ON "cms_authors" USING btree ("image_id");
  CREATE INDEX "cms_authors_updated_at_idx" ON "cms_authors" USING btree ("updated_at");
  CREATE INDEX "cms_authors_created_at_idx" ON "cms_authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "cms_categories_slug_idx" ON "cms_categories" USING btree ("slug");
  CREATE INDEX "cms_categories_parent_idx" ON "cms_categories" USING btree ("parent_id");
  CREATE INDEX "cms_categories_updated_at_idx" ON "cms_categories" USING btree ("updated_at");
  CREATE INDEX "cms_categories_created_at_idx" ON "cms_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "cms_tags_slug_idx" ON "cms_tags" USING btree ("slug");
  CREATE INDEX "cms_tags_updated_at_idx" ON "cms_tags" USING btree ("updated_at");
  CREATE INDEX "cms_tags_created_at_idx" ON "cms_tags" USING btree ("created_at");
  CREATE INDEX "cms_posts_rels_order_idx" ON "cms_posts_rels" USING btree ("order");
  CREATE INDEX "cms_posts_rels_parent_idx" ON "cms_posts_rels" USING btree ("parent_id");
  CREATE INDEX "cms_posts_rels_path_idx" ON "cms_posts_rels" USING btree ("path");
  CREATE INDEX "cms_posts_rels_cms_categories_id_idx" ON "cms_posts_rels" USING btree ("cms_categories_id");
  CREATE INDEX "cms_posts_rels_cms_tags_id_idx" ON "cms_posts_rels" USING btree ("cms_tags_id");
  CREATE INDEX "_cms_posts_v_rels_order_idx" ON "_cms_posts_v_rels" USING btree ("order");
  CREATE INDEX "_cms_posts_v_rels_parent_idx" ON "_cms_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_cms_posts_v_rels_path_idx" ON "_cms_posts_v_rels" USING btree ("path");
  CREATE INDEX "_cms_posts_v_rels_cms_categories_id_idx" ON "_cms_posts_v_rels" USING btree ("cms_categories_id");
  CREATE INDEX "_cms_posts_v_rels_cms_tags_id_idx" ON "_cms_posts_v_rels" USING btree ("cms_tags_id");
  CREATE UNIQUE INDEX "cms_redirects_from_idx" ON "cms_redirects" USING btree ("from");
  CREATE INDEX "cms_redirects_updated_at_idx" ON "cms_redirects" USING btree ("updated_at");
  CREATE INDEX "cms_redirects_created_at_idx" ON "cms_redirects" USING btree ("created_at");
  CREATE INDEX "cms_redirects_rels_order_idx" ON "cms_redirects_rels" USING btree ("order");
  CREATE INDEX "cms_redirects_rels_parent_idx" ON "cms_redirects_rels" USING btree ("parent_id");
  CREATE INDEX "cms_redirects_rels_path_idx" ON "cms_redirects_rels" USING btree ("path");
  CREATE INDEX "cms_redirects_rels_cms_pages_id_idx" ON "cms_redirects_rels" USING btree ("cms_pages_id");
  CREATE INDEX "cms_redirects_rels_cms_posts_id_idx" ON "cms_redirects_rels" USING btree ("cms_posts_id");
  CREATE INDEX "cms_search_search_text_idx" ON "cms_search" USING btree ("search_text");
  CREATE INDEX "cms_search_updated_at_idx" ON "cms_search" USING btree ("updated_at");
  CREATE INDEX "cms_search_created_at_idx" ON "cms_search" USING btree ("created_at");
  CREATE INDEX "cms_search_rels_order_idx" ON "cms_search_rels" USING btree ("order");
  CREATE INDEX "cms_search_rels_parent_idx" ON "cms_search_rels" USING btree ("parent_id");
  CREATE INDEX "cms_search_rels_path_idx" ON "cms_search_rels" USING btree ("path");
  CREATE INDEX "cms_search_rels_cms_pages_id_idx" ON "cms_search_rels" USING btree ("cms_pages_id");
  CREATE INDEX "cms_search_rels_cms_posts_id_idx" ON "cms_search_rels" USING btree ("cms_posts_id");
  CREATE INDEX "cms_header_navigation_items_order_idx" ON "cms_header_navigation_items" USING btree ("_order");
  CREATE INDEX "cms_header_navigation_items_parent_id_idx" ON "cms_header_navigation_items" USING btree ("_parent_id");
  CREATE INDEX "cms_header_navigation_items_page_idx" ON "cms_header_navigation_items" USING btree ("page_id");
  CREATE INDEX "cms_header_navigation_items_post_idx" ON "cms_header_navigation_items" USING btree ("post_id");
  CREATE INDEX "cms_footer_navigation_items_order_idx" ON "cms_footer_navigation_items" USING btree ("_order");
  CREATE INDEX "cms_footer_navigation_items_parent_id_idx" ON "cms_footer_navigation_items" USING btree ("_parent_id");
  CREATE INDEX "cms_footer_navigation_items_page_idx" ON "cms_footer_navigation_items" USING btree ("page_id");
  CREATE INDEX "cms_footer_navigation_items_post_idx" ON "cms_footer_navigation_items" USING btree ("post_id");
  CREATE INDEX "cms_site_settings_meta_meta_image_idx" ON "cms_site_settings" USING btree ("meta_image_id");
  ALTER TABLE "cms_posts" ADD CONSTRAINT "cms_posts_author_id_cms_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."cms_authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_posts" ADD CONSTRAINT "cms_posts_meta_image_id_cms_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_posts_v" ADD CONSTRAINT "_cms_posts_v_version_author_id_cms_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."cms_authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_posts_v" ADD CONSTRAINT "_cms_posts_v_version_meta_image_id_cms_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_meta_image_id_cms_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cms_pages_v" ADD CONSTRAINT "_cms_pages_v_version_meta_image_id_cms_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."cms_media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("cms_authors_id") REFERENCES "public"."cms_authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("cms_categories_id") REFERENCES "public"."cms_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("cms_tags_id") REFERENCES "public"."cms_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("cms_redirects_id") REFERENCES "public"."cms_redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("cms_search_id") REFERENCES "public"."cms_search"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cms_posts_author_idx" ON "cms_posts" USING btree ("author_id");
  CREATE INDEX "cms_posts_meta_meta_image_idx" ON "cms_posts" USING btree ("meta_image_id");
  CREATE INDEX "_cms_posts_v_version_version_author_idx" ON "_cms_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_cms_posts_v_version_meta_version_meta_image_idx" ON "_cms_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "cms_pages_meta_meta_image_idx" ON "cms_pages" USING btree ("meta_image_id");
  CREATE INDEX "_cms_pages_v_version_meta_version_meta_image_idx" ON "_cms_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "payload_locked_documents_rels_cms_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_authors_id");
  CREATE INDEX "payload_locked_documents_rels_cms_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_categories_id");
  CREATE INDEX "payload_locked_documents_rels_cms_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_tags_id");
  CREATE INDEX "payload_locked_documents_rels_cms_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_redirects_id");
  CREATE INDEX "payload_locked_documents_rels_cms_search_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_search_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cms_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_redirects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_search" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_search_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_header_navigation_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_header_navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_footer_navigation_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_footer_navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cms_site_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cms_authors" CASCADE;
  DROP TABLE "cms_categories" CASCADE;
  DROP TABLE "cms_tags" CASCADE;
  DROP TABLE "cms_posts_rels" CASCADE;
  DROP TABLE "_cms_posts_v_rels" CASCADE;
  DROP TABLE "cms_redirects" CASCADE;
  DROP TABLE "cms_redirects_rels" CASCADE;
  DROP TABLE "cms_search" CASCADE;
  DROP TABLE "cms_search_rels" CASCADE;
  DROP TABLE "cms_header_navigation_items" CASCADE;
  DROP TABLE "cms_header_navigation" CASCADE;
  DROP TABLE "cms_footer_navigation_items" CASCADE;
  DROP TABLE "cms_footer_navigation" CASCADE;
  DROP TABLE "cms_site_settings" CASCADE;
  ALTER TABLE "cms_posts" RENAME COLUMN "meta_title" TO "seo_title";
  ALTER TABLE "cms_posts" RENAME COLUMN "meta_description" TO "seo_description";
  ALTER TABLE "_cms_posts_v" RENAME COLUMN "version_meta_title" TO "version_seo_title";
  ALTER TABLE "_cms_posts_v" RENAME COLUMN "version_meta_description" TO "version_seo_description";
  ALTER TABLE "cms_pages" RENAME COLUMN "meta_title" TO "seo_title";
  ALTER TABLE "cms_pages" RENAME COLUMN "meta_description" TO "seo_description";
  ALTER TABLE "_cms_pages_v" RENAME COLUMN "version_meta_title" TO "version_seo_title";
  ALTER TABLE "_cms_pages_v" RENAME COLUMN "version_meta_description" TO "version_seo_description";
  ALTER TABLE "cms_posts" DROP CONSTRAINT "cms_posts_author_id_cms_authors_id_fk";
  
  ALTER TABLE "cms_posts" DROP CONSTRAINT "cms_posts_meta_image_id_cms_media_id_fk";
  
  ALTER TABLE "_cms_posts_v" DROP CONSTRAINT "_cms_posts_v_version_author_id_cms_authors_id_fk";
  
  ALTER TABLE "_cms_posts_v" DROP CONSTRAINT "_cms_posts_v_version_meta_image_id_cms_media_id_fk";
  
  ALTER TABLE "cms_pages" DROP CONSTRAINT "cms_pages_meta_image_id_cms_media_id_fk";
  
  ALTER TABLE "_cms_pages_v" DROP CONSTRAINT "_cms_pages_v_version_meta_image_id_cms_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_authors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_search_fk";
  
  DROP INDEX "cms_posts_author_idx";
  DROP INDEX "cms_posts_meta_meta_image_idx";
  DROP INDEX "_cms_posts_v_version_version_author_idx";
  DROP INDEX "_cms_posts_v_version_meta_version_meta_image_idx";
  DROP INDEX "cms_pages_meta_meta_image_idx";
  DROP INDEX "_cms_pages_v_version_meta_version_meta_image_idx";
  DROP INDEX "payload_locked_documents_rels_cms_authors_id_idx";
  DROP INDEX "payload_locked_documents_rels_cms_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_cms_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_cms_redirects_id_idx";
  DROP INDEX "payload_locked_documents_rels_cms_search_id_idx";
  ALTER TABLE "cms_posts" DROP COLUMN "author_id";
  ALTER TABLE "cms_posts" DROP COLUMN "meta_image_id";
  ALTER TABLE "_cms_posts_v" DROP COLUMN "version_author_id";
  ALTER TABLE "_cms_posts_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "cms_pages" DROP COLUMN "meta_image_id";
  ALTER TABLE "_cms_pages_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cms_authors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cms_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cms_tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cms_redirects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cms_search_id";
  DROP TYPE "public"."enum_cms_redirects_to_type";
  DROP TYPE "public"."enum_cms_redirects_type";
  DROP TYPE "public"."enum_cms_header_navigation_items_type";
  DROP TYPE "public"."enum_cms_footer_navigation_items_type";`)
}
