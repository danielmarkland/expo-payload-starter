import {
  createAdapterFactory,
  type CleanedWhere,
  type DBAdapter,
} from 'better-auth/adapters'
import type { BetterAuthOptions } from 'better-auth'
import type { Pool, QueryResult } from 'pg'
import { realmKey, type IdentityRealm } from './index.js'

export const authSchemaSQL = `
create schema if not exists identity;
do $roles$ begin
 if not exists(select 1 from pg_roles where rolname='identity_runtime') then
  create role identity_runtime nologin nobypassrls;
 end if;
 if exists(select 1 from pg_roles where rolname='identity_runtime' and (rolsuper or rolbypassrls or rolcanlogin)) then
  raise exception 'identity_runtime must be a restricted non-login role';
 end if;
end $roles$;
do $grant$ begin execute format('grant identity_runtime to %I',current_user); end $grant$;
create table if not exists identity.records (
 realm text not null, model text not null, id text not null,
 data jsonb not null check (jsonb_typeof(data)='object' and data->>'id'=id),
 primary key(realm,model,id)
);
create unique index if not exists identity_user_email on identity.records(realm,lower(data->>'email')) where model='user';
create unique index if not exists identity_user_phone on identity.records(realm,(data->>'phoneNumber')) where model='user' and data->>'phoneNumber' is not null;
create unique index if not exists identity_account_provider on identity.records(realm,(data->>'providerId'),coalesce(data->>'issuer',''),(data->>'accountId')) where model='account';
create unique index if not exists identity_rate_limit_key on identity.records(realm,(data->>'key')) where model='rateLimit';
create unique index if not exists identity_session_token on identity.records(realm,(data->>'token')) where model='session';
create index if not exists identity_user_reference on identity.records(realm,model,(data->>'userId'));
create index if not exists identity_verification_identifier on identity.records(realm,(data->>'identifier')) where model='verification';
create unique index if not exists identity_oauth_resource on identity.records(realm,(data->>'identifier')) where model='oauthResource';
create unique index if not exists identity_oauth_client_resource on identity.records(realm,(data->>'clientId'),(data->>'resourceId')) where model='oauthClientResource';
create unique index if not exists identity_oauth_client on identity.records(realm,(data->>'clientId')) where model='oauthClient';
create unique index if not exists identity_oauth_token on identity.records(realm,model,(data->>'token')) where model in ('oauthAccessToken','oauthRefreshToken');
create or replace function identity.guard_user_reference() returns trigger language plpgsql set search_path=pg_catalog,identity as $guard$
begin
 if new.model in ('session','account','oauthAccessToken','oauthRefreshToken','oauthConsent') and new.data->>'userId' is not null then
  perform 1 from identity.records where realm=new.realm and model='user' and id=new.data->>'userId' for key share;
  if not found then raise foreign_key_violation using message='Identity user must exist in the same realm'; end if;
 end if;
 return new;
end $guard$;
drop trigger if exists identity_user_reference_guard on identity.records;
create trigger identity_user_reference_guard before insert or update on identity.records for each row execute function identity.guard_user_reference();
create or replace function identity.delete_user_records() returns trigger language plpgsql set search_path=pg_catalog,identity as $cascade$
begin
 if old.model='user' then
  delete from identity.records where realm=old.realm and model in ('session','account','oauthAccessToken','oauthRefreshToken','oauthConsent') and data->>'userId'=old.id;
 end if;
 return old;
end $cascade$;
drop trigger if exists identity_user_reference_cascade on identity.records;
create trigger identity_user_reference_cascade after delete on identity.records for each row execute function identity.delete_user_records();
alter table identity.records enable row level security;
revoke all on schema identity from public;
revoke all on identity.records from public;
grant usage on schema identity to identity_runtime;
grant select,insert,update,delete on identity.records to identity_runtime;
drop policy if exists identity_runtime_realm on identity.records;
create policy identity_runtime_realm on identity.records to identity_runtime
 using(realm=current_setting('groovepost.identity_realm',true))
 with check(realm=current_setting('groovepost.identity_realm',true));
`

type Database = {
  query: (sql: string, values?: unknown[]) => Promise<QueryResult>
}
// The namespace is server-selected and immutable for the life of an adapter.
// Values, JSON field names and model names are always bound parameters.
export function scopedPostgresAdapter(pool: Pool, realm: IdentityRealm) {
  const namespace = realmKey(realm)
  const scoped: Database = {
    query: async (sql: string, values?: unknown[]) => {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query('SET LOCAL ROLE identity_runtime')
        await client.query(
          "select set_config('groovepost.identity_realm',$1,true)",
          [namespace],
        )
        const result = await client.query(sql, values)
        await client.query('COMMIT')
        return result
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
  }
  return build(scoped, namespace, pool)
}
function build(db: Database, namespace: string, pool?: Pool) {
  let options: BetterAuthOptions
  const factory = createAdapterFactory({
    config: {
      adapterId: 'realm-postgres',
      adapterName: 'Realm-scoped PostgreSQL',
      supportsDates: false,
      supportsJSON: true,
      supportsArrays: true,
      supportsBooleans: true,
      transaction: pool
        ? async (callback) => {
            const client = await pool.connect()
            try {
              await client.query('BEGIN')
              await client.query('SET LOCAL ROLE identity_runtime')
              await client.query(
                "select set_config('groovepost.identity_realm',$1,true)",
                [namespace],
              )
              const result = await callback(build(client, namespace)(options))
              await client.query('COMMIT')
              return result
            } catch (error) {
              await client.query('ROLLBACK')
              throw error
            } finally {
              client.release()
            }
          }
        : false,
    },
    adapter: (context) => {
      options = context.options
      function query(model: string, where: CleanedWhere[] = []) {
        const values: unknown[] = [namespace, model]
        const bind = (value: unknown) => {
          values.push(value)
          return `$${values.length}`
        }
        const predicates = where.map((w) => {
          const field = `coalesce(data -> ${bind(w.field)},'null'::jsonb)`
          const value = (v: unknown) =>
            `${bind(JSON.stringify(v ?? null))}::jsonb`
          let expression: string
          const operator = w.operator ?? 'eq'
          if (operator === 'in' || operator === 'not_in') {
            if (!Array.isArray(w.value))
              throw new Error('Invalid auth predicate')
            expression = w.value.length
              ? `${field} ${operator === 'in' ? 'in' : 'not in'} (${w.value.map(value).join(',')})`
              : operator === 'in'
                ? 'false'
                : 'true'
          } else if (
            ['contains', 'starts_with', 'ends_with'].includes(operator)
          ) {
            // strpos treats provider input literally, including SQL wildcard characters.
            const text = `data ->> ${bind(w.field)}`,
              term = bind(String(w.value))
            expression =
              operator === 'contains'
                ? `strpos(${text},${term})>0`
                : operator === 'starts_with'
                  ? `left(${text},length(${term}))=${term}`
                  : `right(${text},length(${term}))=${term}`
          } else {
            const operators: Record<string, string> = {
              eq: '=',
              ne: '<>',
              lt: '<',
              lte: '<=',
              gt: '>',
              gte: '>=',
            }
            const op = operators[operator]
            if (!op) throw new Error('Unsupported auth predicate')
            expression =
              w.mode === 'insensitive' && typeof w.value === 'string'
                ? `lower(data ->> ${bind(w.field)}) ${op} lower(${bind(w.value)})`
                : `${field} ${op} ${value(w.value)}`
          }
          return { expression, connector: w.connector ?? 'AND' }
        })
        // AND takes precedence over OR inside the namespace boundary.
        const groups: string[][] = [[]]
        for (const [i, p] of predicates.entries()) {
          if (i && p.connector === 'OR') groups.push([])
          groups.at(-1)!.push(p.expression)
        }
        const sql =
          'realm=$1 and model=$2' +
          (predicates.length
            ? ` and (${groups.map((g) => `(${g.join(' and ')})`).join(' or ')})`
            : '')
        return { values, bind, sql }
      }
      const first = async <T>(
        sql: string,
        values: unknown[],
      ): Promise<T | null> =>
        (await db.query(sql, values)).rows[0]?.data ?? null
      return {
        create: async ({ model, data }) => {
          if (!data.id) throw new Error('Auth record requires an id')
          return (
            await db.query(
              'insert into identity.records(realm,model,id,data) values($1,$2,$3,$4) returning data',
              [namespace, model, data.id, JSON.stringify(data)],
            )
          ).rows[0].data
        },
        findOne: async ({ model, where }) => {
          const q = query(model, where)
          return first(
            `select data from identity.records where ${q.sql} order by id limit 1`,
            q.values,
          )
        },
        findMany: async ({ model, where, limit, offset, sortBy }) => {
          const q = query(model, where)
          const order = sortBy
            ? `data -> ${q.bind(sortBy.field)} ${sortBy.direction === 'desc' ? 'desc' : 'asc'},id`
            : 'id'
          const sql = `select data from identity.records where ${q.sql} order by ${order} limit ${q.bind(limit)} offset ${q.bind(offset ?? 0)}`
          return (await db.query(sql, q.values)).rows.map((r) => r.data)
        },
        count: async ({ model, where }) => {
          const q = query(model, where)
          return Number(
            (
              await db.query(
                `select count(*) as count from identity.records where ${q.sql}`,
                q.values,
              )
            ).rows[0].count,
          )
        },
        update: async ({ model, where, update }) => {
          const q = query(model, where)
          const patch = q.bind(JSON.stringify(update))
          return first(
            `update identity.records set data=data || ${patch}::jsonb where (realm,model,id) in (select realm,model,id from identity.records where ${q.sql} order by id limit 1 for update) returning data`,
            q.values,
          )
        },
        updateMany: async ({ model, where, update }) => {
          const q = query(model, where)
          const patch = q.bind(JSON.stringify(update))
          return (
            (
              await db.query(
                `update identity.records set data=data || ${patch}::jsonb where ${q.sql}`,
                q.values,
              )
            ).rowCount ?? 0
          )
        },
        delete: async ({ model, where }) => {
          const q = query(model, where)
          await db.query(
            `delete from identity.records where (realm,model,id) in (select realm,model,id from identity.records where ${q.sql} order by id limit 1 for update)`,
            q.values,
          )
        },
        deleteMany: async ({ model, where }) => {
          const q = query(model, where)
          return (
            (
              await db.query(
                `delete from identity.records where ${q.sql}`,
                q.values,
              )
            ).rowCount ?? 0
          )
        },
        consumeOne: async ({ model, where }) => {
          const q = query(model, where)
          return first(
            `delete from identity.records where (realm,model,id) in (select realm,model,id from identity.records where ${q.sql} order by id limit 1 for update) returning data`,
            q.values,
          )
        },
        incrementOne: async ({ model, where, increment, set }) => {
          const q = query(model, where)
          let patch = `${q.bind(JSON.stringify(set ?? {}))}::jsonb`
          for (const [field, delta] of Object.entries(increment)) {
            if (!Number.isFinite(delta)) throw new Error('Invalid auth counter')
            const key = q.bind(field)
            patch += ` || jsonb_build_object(${key}::text,coalesce((data ->> ${key})::numeric,0)+${q.bind(delta)}::numeric)`
          }
          return first(
            `update identity.records set data=data || ${patch} where (realm,model,id) in (select realm,model,id from identity.records where ${q.sql} order by id limit 1 for update) returning data`,
            q.values,
          )
        },
      }
    },
  })
  return (configuration: BetterAuthOptions): DBAdapter => {
    options = configuration
    return factory(configuration)
  }
}
