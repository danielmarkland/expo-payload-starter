import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_pages_blocks_hero" ALTER COLUMN "heading" SET DATA TYPE jsonb USING (
    CASE WHEN "heading" IS NULL THEN NULL ELSE jsonb_build_object(
      'root', jsonb_build_object(
        'children', jsonb_build_array(jsonb_build_object(
          'children', jsonb_build_array(jsonb_build_object(
            'detail', 0, 'format', 0, 'mode', 'normal', 'style', '',
            'text', "heading", 'type', 'text', 'version', 1
          )),
          'direction', 'ltr', 'format', '', 'indent', 0,
          'type', 'paragraph', 'version', 1
        )),
        'direction', 'ltr', 'format', '', 'indent', 0,
        'type', 'root', 'version', 1
      )
    ) END
  );
  ALTER TABLE "_cms_pages_v_blocks_hero" ALTER COLUMN "heading" SET DATA TYPE jsonb USING (
    CASE WHEN "heading" IS NULL THEN NULL ELSE jsonb_build_object(
      'root', jsonb_build_object(
        'children', jsonb_build_array(jsonb_build_object(
          'children', jsonb_build_array(jsonb_build_object(
            'detail', 0, 'format', 0, 'mode', 'normal', 'style', '',
            'text', "heading", 'type', 'text', 'version', 1
          )),
          'direction', 'ltr', 'format', '', 'indent', 0,
          'type', 'paragraph', 'version', 1
        )),
        'direction', 'ltr', 'format', '', 'indent', 0,
        'type', 'root', 'version', 1
      )
    ) END
  );
  ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "secondary_heading" varchar;
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "secondary_heading" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms_pages_blocks_hero" ADD COLUMN "heading_text" varchar;
  UPDATE "cms_pages_blocks_hero" AS hero SET "heading_text" = (
    SELECT string_agg(
      CASE WHEN node->>'type' = 'linebreak' THEN E'\n' ELSE COALESCE(node->>'text', '') END,
      '' ORDER BY paragraph_position, node_position
    )
    FROM jsonb_array_elements(hero."heading"->'root'->'children') WITH ORDINALITY AS paragraph(value, paragraph_position)
    CROSS JOIN jsonb_array_elements(paragraph.value->'children') WITH ORDINALITY AS child(node, node_position)
  );
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "heading";
  ALTER TABLE "cms_pages_blocks_hero" RENAME COLUMN "heading_text" TO "heading";
  ALTER TABLE "_cms_pages_v_blocks_hero" ADD COLUMN "heading_text" varchar;
  UPDATE "_cms_pages_v_blocks_hero" AS hero SET "heading_text" = (
    SELECT string_agg(
      CASE WHEN node->>'type' = 'linebreak' THEN E'\n' ELSE COALESCE(node->>'text', '') END,
      '' ORDER BY paragraph_position, node_position
    )
    FROM jsonb_array_elements(hero."heading"->'root'->'children') WITH ORDINALITY AS paragraph(value, paragraph_position)
    CROSS JOIN jsonb_array_elements(paragraph.value->'children') WITH ORDINALITY AS child(node, node_position)
  );
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "heading";
  ALTER TABLE "_cms_pages_v_blocks_hero" RENAME COLUMN "heading_text" TO "heading";
  ALTER TABLE "cms_pages_blocks_hero" DROP COLUMN "secondary_heading";
  ALTER TABLE "_cms_pages_v_blocks_hero" DROP COLUMN "secondary_heading";`)
}
