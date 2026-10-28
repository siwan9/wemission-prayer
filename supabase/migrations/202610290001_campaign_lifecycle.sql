-- 1) Minimal camp grouping (already applied through line 61)

create extension if not exists pgcrypto;

create table if not exists public.camps (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  season text not null check (season in ('여름', '겨울')),
  created_at timestamptz not null default now(),
  unique (year, season)
);

alter table public.settings add column if not exists current_camp_id uuid;
alter table public.registrations add column if not exists camp_id uuid;

do $$
declare previous_id uuid; current_id uuid;
begin
  insert into public.camps(year, season) values (2026, '여름')
  on conflict (year, season) do update set year = excluded.year returning id into previous_id;

  insert into public.camps(year, season)
  select camp_year, camp_season from public.settings limit 1
  on conflict (year, season) do update set year = excluded.year returning id into current_id;

  update public.settings set current_camp_id = current_id where current_camp_id is null;

  update public.registrations r
  set camp_id = case
    when exists (
      select 1 from public.settings s, unnest(r.dates) d
      where d::date between s.service_start_date and s.service_end_date
    ) then current_id else previous_id end
  where camp_id is null;
end $$;

alter table public.settings alter column current_camp_id set not null;
alter table public.registrations alter column camp_id set not null;

alter table public.settings
  drop constraint if exists settings_current_camp_id_fkey,
  add constraint settings_current_camp_id_fkey foreign key (current_camp_id)
    references public.camps(id) on delete restrict;

alter table public.registrations
  drop constraint if exists registrations_camp_id_fkey,
  add constraint registrations_camp_id_fkey foreign key (camp_id)
    references public.camps(id) on delete restrict;

create index if not exists registrations_camp_id_idx on public.registrations(camp_id);

-- camps only contains year/season metadata, so it is safe to expose for labels.
alter table public.camps enable row level security;
drop policy if exists camps_public_read on public.camps;
create policy camps_public_read
  on public.camps for select
  to anon, authenticated
  using (true);
grant select on public.camps to anon, authenticated;

-- 2) Run only the functions below after the structure above is ready.

-- Starts a new camp atomically. Existing settings content is preserved.
create or replace function public.start_camp(
  p_admin_pin text, p_year integer, p_season text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare new_camp_id uuid;
begin
  if not exists(select 1 from settings where admin_pin::text = p_admin_pin) then return false; end if;
  if p_season not in ('여름', '겨울') then raise exception '계절 정보가 올바르지 않습니다.'; end if;

  insert into camps(year, season) values (p_year, p_season)
  on conflict (year, season) do update set year = excluded.year
  returning id into new_camp_id;

  update settings
  set current_camp_id = new_camp_id, camp_year = p_year, camp_season = p_season;

  delete from camp_dates;
  return true;
end $$;

-- Returns an archived prayer only after its PIN is verified.
create or replace function public.get_archived_prayer(p_id uuid, p_pin text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id', r.id, 'name', r.name, 'role', r.role,
    'church_name', r.church_name, 'prayer_request', r.prayer_request,
    'dates', r.dates, 'camp_id', c.id,
    'camp_year', c.year, 'camp_season', c.season
  )
  from registrations r
  join camps c on c.id = r.camp_id
  cross join settings s
  where r.id = p_id and r.pin::text = p_pin
    and r.camp_id <> s.current_camp_id;
$$;

-- Existing function reinforced so only current-camp registrations can change.
create or replace function public.update_registration(
  p_id uuid, p_original_pin text, p_new_pin text, p_name text, p_role text,
  p_church_name text, p_prayer_request text, p_dates date[]
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare affected integer;
begin
  update registrations r
  set name = p_name, role = p_role, church_name = p_church_name,
      prayer_request = p_prayer_request, dates = p_dates, pin = p_new_pin
  from settings s
  where r.id = p_id and r.pin::text = p_original_pin
    and r.camp_id = s.current_camp_id
    and not exists(select 1 from unnest(p_dates) d where d < s.service_start_date or d > s.service_end_date);
  get diagnostics affected = row_count;
  return affected = 1;
end $$;

-- Existing function reinforced so archived registrations cannot be deleted.
create or replace function public.delete_registration(p_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare affected integer;
begin
  delete from registrations r using settings s
  where r.id = p_id and r.pin::text = p_pin
    and r.camp_id = s.current_camp_id;
  get diagnostics affected = row_count;
  return affected = 1;
end $$;

grant execute on function public.start_camp(text,integer,text) to anon, authenticated;
grant execute on function public.get_archived_prayer(uuid,text) to anon, authenticated;
grant execute on function public.update_registration(uuid,text,text,text,text,text,text,date[]) to anon, authenticated;
grant execute on function public.delete_registration(uuid,text) to anon, authenticated;

-- 3) PIN hardening: secret columns cannot be read directly.
-- User PIN verification happens inside the database. Only a flow verified
-- with the admin PIN can receive PIN values through get_admin_registrations.

create or replace function public.verify_admin_pin(p_pin text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from settings where admin_pin::text = p_pin
  );
$$;

create or replace function public.get_current_prayer(p_id uuid, p_pin text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id', r.id, 'name', r.name, 'role', r.role,
    'church_name', r.church_name, 'prayer_request', r.prayer_request,
    'dates', r.dates, 'created_at', r.created_at, 'camp_id', r.camp_id
  )
  from registrations r
  cross join settings s
  where r.id = p_id
    and r.pin::text = p_pin
    and r.camp_id = s.current_camp_id;
$$;

drop function if exists public.get_admin_registrations(text,uuid);

create or replace function public.get_admin_registrations(
  p_admin_pin text, p_camp_id uuid, p_page integer, p_page_size integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result jsonb;
  item_count bigint;
  safe_page integer := greatest(coalesce(p_page, 1), 1);
  safe_page_size integer := least(greatest(coalesce(p_page_size, 10), 1), 100);
begin
  if not exists(select 1 from settings where admin_pin::text = p_admin_pin) then
    return null;
  end if;

  select count(*) into item_count
  from registrations r
  where r.camp_id = p_camp_id;

  select coalesce(jsonb_agg(to_jsonb(item)), '[]'::jsonb)
  into result
  from (
    select
      r.id, r.name, r.role, r.church_name, r.prayer_request,
      r.dates, r.created_at, r.camp_id, r.pin::text as pin
    from registrations r
    where r.camp_id = p_camp_id
    order by r.dates[1] asc nulls last, r.created_at desc
    limit safe_page_size
    offset (safe_page - 1) * safe_page_size
  ) item;

  return jsonb_build_object('items', result, 'total', item_count);
end $$;

revoke all on function public.verify_admin_pin(text) from public;
revoke all on function public.get_current_prayer(uuid,text) from public;
revoke all on function public.get_admin_registrations(text,uuid,integer,integer) from public;

grant execute on function public.verify_admin_pin(text) to anon, authenticated;
grant execute on function public.get_current_prayer(uuid,text) to anon, authenticated;
grant execute on function public.get_admin_registrations(text,uuid,integer,integer) to anon, authenticated;

-- Table reads remain available for public page data, but secret columns do not.
revoke select on table public.registrations from anon, authenticated;
grant select (
  id, name, role, church_name, prayer_request, dates, created_at, camp_id
) on table public.registrations to anon, authenticated;

revoke select on table public.settings from anon, authenticated;
grant select (
  current_camp_id, camp_year, camp_season, camp_title,
  service_start_date, service_end_date, guide, prayer_points,
  bible_title, bible_content
) on table public.settings to anon, authenticated;

-- 4) Performance: search and aggregate in PostgreSQL instead of the browser.
create extension if not exists pg_trgm;

create index if not exists registrations_name_trgm_idx
  on public.registrations using gin (lower(name) gin_trgm_ops);
create index if not exists registrations_church_name_trgm_idx
  on public.registrations using gin (lower(church_name) gin_trgm_ops);
create index if not exists registrations_dates_gin_idx
  on public.registrations using gin (dates);

create or replace function public.search_archived_prayers(
  p_keyword text, p_limit integer default 50
)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(to_jsonb(item)), '[]'::jsonb)
  from (
    select
      r.id, r.name, r.church_name, r.dates, r.camp_id,
      c.year as camp_year, c.season as camp_season
    from registrations r
    join camps c on c.id = r.camp_id
    cross join settings s
    where r.camp_id <> s.current_camp_id
      and (
        lower(r.name) like '%' || lower(trim(p_keyword)) || '%'
        or lower(r.church_name) like '%' || lower(trim(p_keyword)) || '%'
      )
    order by c.year desc, r.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 50)
  ) item;
$$;

create or replace function public.list_camps_with_counts()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(to_jsonb(item)), '[]'::jsonb)
  from (
    select
      c.id, c.year, c.season,
      count(r.id)::integer as registration_count
    from camps c
    left join registrations r on r.camp_id = c.id
    group by c.id, c.year, c.season
    order by c.year desc,
      case c.season when '겨울' then 2 else 1 end desc
  ) item;
$$;

revoke all on function public.search_archived_prayers(text,integer) from public;
revoke all on function public.list_camps_with_counts() from public;
grant execute on function public.search_archived_prayers(text,integer) to anon, authenticated;
grant execute on function public.list_camps_with_counts() to anon, authenticated;

create or replace function public.get_prayer_month_counts(
  p_month_start date, p_month_end date
)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(to_jsonb(item) order by item.date), '[]'::jsonb)
  from (
    select prayer_date::text as date, count(*)::integer as count
    from registrations r
    cross join settings s
    cross join lateral unnest(r.dates) as prayer_dates(prayer_date)
    where r.camp_id = s.current_camp_id
      and r.dates && array(
        select generate_series(p_month_start, p_month_end, interval '1 day')::date
      )
      and prayer_date between p_month_start and p_month_end
    group by prayer_date
  ) item;
$$;

create or replace function public.get_prayers_by_date(p_date date)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(to_jsonb(item)), '[]'::jsonb)
  from (
    select
      r.id, r.name, r.role, r.church_name, r.prayer_request,
      r.dates, r.created_at, r.camp_id
    from registrations r
    cross join settings s
    where r.camp_id = s.current_camp_id
      and r.dates @> array[p_date]
    order by r.created_at asc
  ) item;
$$;

create or replace function public.search_current_prayers(
  p_keyword text, p_limit integer default 50
)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(to_jsonb(item)), '[]'::jsonb)
  from (
    select
      r.id, r.name, r.role, r.church_name, r.prayer_request,
      r.dates, r.created_at, r.camp_id
    from registrations r
    cross join settings s
    where r.camp_id = s.current_camp_id
      and (
        lower(r.name) like '%' || lower(trim(p_keyword)) || '%'
        or lower(r.church_name) like '%' || lower(trim(p_keyword)) || '%'
      )
    order by r.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 50)
  ) item;
$$;

revoke all on function public.get_prayer_month_counts(date,date) from public;
revoke all on function public.get_prayers_by_date(date) from public;
revoke all on function public.search_current_prayers(text,integer) from public;
grant execute on function public.get_prayer_month_counts(date,date) to anon, authenticated;
grant execute on function public.get_prayers_by_date(date) to anon, authenticated;
grant execute on function public.search_current_prayers(text,integer) to anon, authenticated;
