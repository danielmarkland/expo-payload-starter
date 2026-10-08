import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'
export async function up({ db }: MigrateUpArgs) {
  await db.execute(
    sql`alter table public.cms_users add column auth_identity_id varchar;create unique index cms_users_auth_identity_id_idx on public.cms_users(auth_identity_id);`,
  )
}
export async function down({ db }: MigrateDownArgs) {
  await db.execute(
    sql`drop index public.cms_users_auth_identity_id_idx;alter table public.cms_users drop column auth_identity_id;`,
  )
}
