create schema app;
grant usage on schema app to authenticated, service_role;

create table app.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table app.profiles enable row level security;

revoke all on table app.profiles from anon, authenticated, service_role;
grant select, update on table app.profiles to authenticated;
grant all on table app.profiles to service_role;

create policy "profiles_select_own"
on app.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on app.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create function app.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into app.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure app.create_profile_for_new_user();

create function app.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on app.profiles
for each row execute procedure app.set_updated_at();

create table app.email_delivery_events (
  id uuid primary key default gen_random_uuid(),
  email_id text not null,
  event_type text not null check (event_type in ('sent', 'delivered', 'bounced', 'complained')),
  occurred_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (email_id, event_type, occurred_at)
);

alter table app.email_delivery_events enable row level security;
revoke all on table app.email_delivery_events from anon, authenticated, service_role;
grant select, insert, update on table app.email_delivery_events to service_role;

-- Supabase's local defaults grant non-data privileges on every new public table.
-- Payload tables must have no client-role privileges, so future product tables
-- must declare their grants explicitly as the tables above do.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

insert into storage.buckets (id, name, public)
values ('app-uploads', 'app-uploads', false), ('cms-media', 'cms-media', false)
on conflict (id) do nothing;

create policy "app_uploads_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'app-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "app_uploads_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'app-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "app_uploads_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'app-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'app-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "app_uploads_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'app-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
