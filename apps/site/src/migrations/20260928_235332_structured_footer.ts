import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_footer_navigation_social_links_icon" AS ENUM('github', 'linkedin', 'mail', 'youtube', 'twitter');
  CREATE TABLE "cms_footer_navigation_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"icon" "enum_cms_footer_navigation_social_links_icon" NOT NULL,
  	"url" varchar NOT NULL,
  	"new_tab" boolean DEFAULT true
  );
  
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "tagline" varchar;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "latest_posts_show" boolean DEFAULT true NOT NULL;
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "latest_posts_heading" varchar DEFAULT 'Latest posts';
  ALTER TABLE "cms_footer_navigation" ADD COLUMN "copyright_owner" varchar;
  ALTER TABLE "cms_footer_navigation_social_links" ADD CONSTRAINT "cms_footer_navigation_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_footer_navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cms_footer_navigation_social_links_order_idx" ON "cms_footer_navigation_social_links" USING btree ("_order");
  CREATE INDEX "cms_footer_navigation_social_links_parent_id_idx" ON "cms_footer_navigation_social_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms_footer_navigation_social_links" CASCADE;
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "tagline";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "latest_posts_show";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "latest_posts_heading";
  ALTER TABLE "cms_footer_navigation" DROP COLUMN "copyright_owner";
  DROP TYPE "public"."enum_cms_footer_navigation_social_links_icon";`)
}
