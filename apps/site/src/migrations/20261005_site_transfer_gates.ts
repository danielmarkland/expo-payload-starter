import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "cms_publishing_transfer_gates" (
      "id" serial PRIMARY KEY NOT NULL,
      "key" varchar NOT NULL,
      "nonce" varchar NOT NULL,
      "last_replacement" varchar,
      "backup_key" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "cms_publishing_transfer_gates_key_idx" ON "cms_publishing_transfer_gates" ("key");
    CREATE INDEX "cms_publishing_transfer_gates_updated_at_idx" ON "cms_publishing_transfer_gates" ("updated_at");
    CREATE INDEX "cms_publishing_transfer_gates_created_at_idx" ON "cms_publishing_transfer_gates" ("created_at");
    REVOKE ALL ON "cms_publishing_transfer_gates" FROM PUBLIC;
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON "cms_publishing_transfer_gates" FROM anon;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON "cms_publishing_transfer_gates" FROM authenticated;
      END IF;
    END $$;
  `)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "cms_publishing_transfer_gates";`)
}
