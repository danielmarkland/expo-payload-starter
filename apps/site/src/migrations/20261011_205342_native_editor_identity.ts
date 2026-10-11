import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms_users_sessions" CASCADE;
  ALTER TABLE "cms_users" DROP COLUMN "reset_password_token";
  ALTER TABLE "cms_users" DROP COLUMN "reset_password_expiration";
  ALTER TABLE "cms_users" DROP COLUMN "salt";
  ALTER TABLE "cms_users" DROP COLUMN "hash";
  ALTER TABLE "cms_users" DROP COLUMN "reset_password_requested_at";
  ALTER TABLE "cms_users" DROP COLUMN "login_attempts";
  ALTER TABLE "cms_users" DROP COLUMN "lock_until";
`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "cms_users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  ALTER TABLE "cms_users" ADD COLUMN "reset_password_token" varchar;
  ALTER TABLE "cms_users" ADD COLUMN "reset_password_expiration" timestamp(3) with time zone;
  ALTER TABLE "cms_users" ADD COLUMN "salt" varchar;
  ALTER TABLE "cms_users" ADD COLUMN "hash" varchar;
  ALTER TABLE "cms_users" ADD COLUMN "reset_password_requested_at" timestamp(3) with time zone;
  ALTER TABLE "cms_users" ADD COLUMN "login_attempts" numeric DEFAULT 0;
  ALTER TABLE "cms_users" ADD COLUMN "lock_until" timestamp(3) with time zone;

  ALTER TABLE "cms_users_sessions" ADD CONSTRAINT "cms_users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cms_users_sessions_order_idx" ON "cms_users_sessions" USING btree ("_order");
  CREATE INDEX "cms_users_sessions_parent_id_idx" ON "cms_users_sessions" USING btree ("_parent_id");`)
}
