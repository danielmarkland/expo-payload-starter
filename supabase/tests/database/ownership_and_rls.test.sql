begin;
select plan(6);

select has_table('app', 'profiles', 'profiles table exists');

select is(
  (select relrowsecurity from pg_class where oid = 'app.profiles'::regclass),
  true,
  'profiles has RLS enabled'
);

select is(
  (select count(*)::integer from pg_policies where schemaname = 'app' and tablename = 'profiles'),
  2,
  'profiles has explicit select and update policies'
);

select is(
  (select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'app_uploads_%'),
  4,
  'app uploads has CRUD ownership policies'
);

select ok(
  (select count(*) > 0 from information_schema.tables where table_schema = 'public' and (table_name like 'cms_%' or table_name like 'payload_%')),
  'Payload-owned tables exist after Payload migrations'
);

select is(
  (
    select count(*)::integer
    from information_schema.role_table_grants
    where table_schema = 'public'
      and (table_name like 'cms_%' or table_name like 'payload_%' or table_name like '\_cms_%')
      and grantee in ('anon', 'authenticated')
  ),
  0,
  'Supabase client roles have no grants on Payload-owned tables'
);

select * from finish();
rollback;
