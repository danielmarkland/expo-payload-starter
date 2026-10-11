create schema app;
revoke all on schema app from public;
create table app.profiles(id uuid primary key,display_name text,avatar_url text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table app.profiles enable row level security;
create function app.set_updated_at() returns trigger language plpgsql set search_path=pg_catalog as $$ begin new.updated_at=now(); return new; end; $$;
create trigger profiles_set_updated_at before update on app.profiles for each row execute function app.set_updated_at();

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

create table app.identity_context(singleton boolean primary key default true check(singleton),tenant_id uuid not null unique default gen_random_uuid());
insert into app.identity_context(singleton) values(true);
revoke all on app.identity_context from public;
-- Requests are verified by the host, then scoped again with a non-bypass database role.

do $$ begin
 if not exists(select 1 from pg_roles where rolname='starter_product_runtime') then create role starter_product_runtime nologin nobypassrls;end if;
 if exists(select 1 from pg_roles where rolname='starter_product_runtime' and (rolsuper or rolbypassrls or rolcanlogin))then raise exception 'Unsafe product runtime role';end if;
end $$;
do $$ begin execute format('grant starter_product_runtime to %I',current_user);end $$;
grant usage on schema app to starter_product_runtime;
grant select,insert,update on app.profiles to starter_product_runtime;
create policy server_profile_actor on app.profiles to starter_product_runtime
 using(id::text=current_setting('starter.actor',true)) with check(id::text=current_setting('starter.actor',true));



do $$ begin if not exists(select 1 from pg_roles where rolname='starter_payload') then create role starter_payload nologin nobypassrls;end if; end $$;
grant usage on schema app to starter_payload;
grant select on app.identity_context to starter_payload;
do $$ begin execute format('grant starter_payload to %I',current_user);end $$;
grant usage,create on schema public to starter_payload;
alter default privileges in schema public grant all on tables to starter_payload;
alter default privileges in schema public grant usage,select,update on sequences to starter_payload;
revoke create on schema public from public;
