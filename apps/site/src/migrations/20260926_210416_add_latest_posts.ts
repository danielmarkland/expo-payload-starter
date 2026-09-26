import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "cms_pages_blocks_latest_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Latest posts',
  	"limit" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cms_pages_v_blocks_latest_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Latest posts',
  	"limit" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "cms_pages_blocks_latest_posts" ADD CONSTRAINT "cms_pages_blocks_latest_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cms_pages_v_blocks_latest_posts" ADD CONSTRAINT "_cms_pages_v_blocks_latest_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cms_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cms_pages_blocks_latest_posts_order_idx" ON "cms_pages_blocks_latest_posts" USING btree ("_order");
  CREATE INDEX "cms_pages_blocks_latest_posts_parent_id_idx" ON "cms_pages_blocks_latest_posts" USING btree ("_parent_id");
  CREATE INDEX "cms_pages_blocks_latest_posts_path_idx" ON "cms_pages_blocks_latest_posts" USING btree ("_path");
  CREATE INDEX "_cms_pages_v_blocks_latest_posts_order_idx" ON "_cms_pages_v_blocks_latest_posts" USING btree ("_order");
  CREATE INDEX "_cms_pages_v_blocks_latest_posts_parent_id_idx" ON "_cms_pages_v_blocks_latest_posts" USING btree ("_parent_id");
  CREATE INDEX "_cms_pages_v_blocks_latest_posts_path_idx" ON "_cms_pages_v_blocks_latest_posts" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms_pages_blocks_latest_posts" CASCADE;
  DROP TABLE "_cms_pages_v_blocks_latest_posts" CASCADE;`)
}
