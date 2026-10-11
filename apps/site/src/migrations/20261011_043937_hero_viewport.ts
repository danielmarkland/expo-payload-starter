import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cms_pages_blocks_hero_vertical_alignment" AS ENUM('top', 'middle', 'bottom');
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_vertical_alignment" AS ENUM('top', 'middle', 'bottom');
  ALTER TYPE "public"."enum_cms_pages_blocks_hero_height" ADD VALUE 'viewport';
  ALTER TYPE "public"."enum__cms_pages_v_blocks_hero_height" ADD VALUE 'viewport';
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "vertical_alignment" "enum_cms_pages_blocks_hero_vertical_alignment" DEFAULT 'middle';
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "vertical_alignment" "enum__cms_pages_v_blocks_hero_vertical_alignment" DEFAULT 'middle';
`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "cms_pages_blocks_hero" SET "height" = 'standard' WHERE "height" = 'viewport';
  UPDATE "_cms_pages_v_blocks_hero" SET "height" = 'standard' WHERE "height" = 'viewport';
  ALTER TABLE "cms_pages_blocks_hero" ALTER COLUMN "height" SET DATA TYPE text;
  DROP TYPE "public"."enum_cms_pages_blocks_hero_height";
  CREATE TYPE "public"."enum_cms_pages_blocks_hero_height" AS ENUM('compact', 'standard', 'tall');
  ALTER TABLE "cms_pages_blocks_hero" ALTER COLUMN "height" SET DATA TYPE "public"."enum_cms_pages_blocks_hero_height" USING "height"::"public"."enum_cms_pages_blocks_hero_height";
  ALTER TABLE "_cms_pages_v_blocks_hero" ALTER COLUMN "height" SET DATA TYPE text;
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_height";
  CREATE TYPE "public"."enum__cms_pages_v_blocks_hero_height" AS ENUM('compact', 'standard', 'tall');
  ALTER TABLE "_cms_pages_v_blocks_hero" ALTER COLUMN "height" SET DATA TYPE "public"."enum__cms_pages_v_blocks_hero_height" USING "height"::"public"."enum__cms_pages_v_blocks_hero_height";

  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "vertical_alignment";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "vertical_alignment";
  DROP TYPE "public"."enum_cms_pages_blocks_hero_vertical_alignment";
  DROP TYPE "public"."enum__cms_pages_v_blocks_hero_vertical_alignment";`)
}
