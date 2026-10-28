-- WeMission relay prayer - complete Supabase setup
--
-- Use this file once on a NEW / EMPTY Supabase project.
-- Do not run it as a replacement migration on the current production database.
-- After installation, sign in with the temporary admin PIN CHANGE_ME_NOW and
-- change it immediately from the admin settings page.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Tables and initial singleton rows
-- ---------------------------------------------------------------------------

create table if not exists public.camps (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year between 2000 and 2100),
  season text not null check (season in ('여름', '겨울')),
  created_at timestamptz not null default now(),
  unique (year, season)
);

create table if not exists public.settings (
  id smallint primary key default 1 check (id = 1),
  current_camp_id uuid not null references public.camps(id) on delete restrict,
  camp_year integer not null check (camp_year between 2000 and 2100),
  camp_season text not null check (camp_season in ('여름', '겨울')),
  camp_title text not null default '준비 중',
  service_start_date date not null,
  service_end_date date not null,
  guide text not null default '준비 중입니다.',
  prayer_points text not null default '준비 중입니다.',
  bible_title text not null default '준비 중입니다.',
  bible_content text not null default '준비 중입니다.',
  admin_pin text not null,
  check (service_start_date <= service_end_date)
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  role text not null check (role in ('스탭', '참가자', '기도후원자')),
  church_name text not null check (length(trim(church_name)) > 0),
  prayer_request text not null check (length(trim(prayer_request)) > 0),
  dates date[] not null check (cardinality(dates) > 0),
  pin text not null check (pin ~ '^[0-9]{6}$'),
  camp_id uuid not null references public.camps(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.camp_dates (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  sort_order integer not null check (sort_order > 0),
  check (start_date <= end_date),
  unique (sort_order)
);

create table if not exists public.links (
  id smallint primary key default 1 check (id = 1),
  song_list_url text not null default '',
  song_sheet_url text not null default '',
  camp_intro_url text not null default '',
  instagram_url text not null default '',
  youtube_url text not null default '',
  donation_url text not null default '',
  homepage_url text not null default ''
);

insert into public.camps(year, season)
values (2027, '겨울')
on conflict (year, season) do nothing;

insert into public.settings (
  id, current_camp_id, camp_year, camp_season, camp_title,
  service_start_date, service_end_date, guide, prayer_points,
  bible_title, bible_content, admin_pin
)
select
  1, id, 2027, '겨울', '준비 중',
  date '2027-01-01', date '2027-01-31', '준비 중입니다.', '준비 중입니다.',
  '준비 중입니다.', '준비 중입니다.', 'CHANGE_ME_NOW'
from public.camps
where year = 2027 and season = '겨울'
on conflict (id) do nothing;

insert into public.links (
  id, song_list_url, song_sheet_url, camp_intro_url,
  instagram_url, youtube_url, donation_url, homepage_url
)
values (
  1,
  'https://youtube.com/playlist?list=PLKixBkYt0ZrOD76h64bH_CDNj56oHAyUg&si=5Bf_6kdogM51Atse',
  'https://www.dropbox.com/scl/fo/9ys48effnul4m1ifhgj32/AI0f2RAjT4CBBlznzpc2t9s?rlkey=f0vgeg8piejanrhh57i43sfot&st=8wxq9jla&dl=0',
  'https://wemission.com/camp-teenager/',
  'https://www.instagram.com/we.mission/',
  'https://www.youtube.com/@WEMISSION',
  'https://wemission.com/sponsorship/',
  'https://wemission.com/'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists registrations_camp_id_idx
  on public.registrations(camp_id);
create index if not exists registrations_name_trgm_idx
  on public.registrations using gin (lower(name) gin_trgm_ops);
create index if not exists registrations_church_name_trgm_idx
  on public.registrations using gin (lower(church_name) gin_trgm_ops);
create index if not exists registrations_dates_gin_idx
  on public.registrations using gin (dates);

-- ---------------------------------------------------------------------------
-- Admin and content functions
-- ---------------------------------------------------------------------------

create or replace function public.verify_admin_pin(p_pin text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from settings where admin_pin = p_pin);
$$;

create or replace function public.update_setting(
  p_camp_year integer,
  p_camp_season text,
  p_camp_title text,
  p_service_start_date date,
  p_service_end_date date,
  p_guide text,
  p_prayer_points text,
  p_bible_title text,
  p_bible_content text,
  p_original_admin_pin text,
  p_new_admin_pin text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare affected integer;
begin
  if p_camp_season not in ('여름', '겨울')
     or p_service_start_date > p_service_end_date
     or length(coalesce(p_new_admin_pin, '')) = 0 then
    return false;
  end if;

  update settings
  set camp_year = p_camp_year,
      camp_season = p_camp_season,
      camp_title = p_camp_title,
      service_start_date = p_service_start_date,
      service_end_date = p_service_end_date,
      guide = p_guide,
      prayer_points = p_prayer_points,
      bible_title = p_bible_title,
      bible_content = p_bible_content,
      admin_pin = p_new_admin_pin
  where admin_pin = p_original_admin_pin;

  get diagnostics affected = row_count;
  return affected = 1;
end $$;

create or replace function public.update_links(
  p_admin_pin text,
  p_song_list_url text,
  p_song_sheet_url text,
  p_camp_intro_url text,
  p_instagram_url text,
  p_youtube_url text,
  p_donation_url text,
  p_homepage_url text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists(select 1 from settings where admin_pin = p_admin_pin) then
    return false;
  end if;

  update links
  set song_list_url = p_song_list_url,
      song_sheet_url = p_song_sheet_url,
      camp_intro_url = p_camp_intro_url,
      instagram_url = p_instagram_url,
      youtube_url = p_youtube_url,
      donation_url = p_donation_url,
      homepage_url = p_homepage_url
  where id = 1;
  return found;
end $$;

create or replace function public.create_camp_date(
  p_admin_pin text, p_start_date date, p_end_date date
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare next_order integer;
begin
  if not exists(
    select 1 from settings
    where admin_pin = p_admin_pin
      and p_start_date <= p_end_date
      and p_start_date >= service_start_date
      and p_end_date <= service_end_date
  ) then
    return false;
  end if;

  select coalesce(max(sort_order), 0) + 1 into next_order from camp_dates;
  insert into camp_dates(start_date, end_date, sort_order)
  values (p_start_date, p_end_date, next_order);
  return true;
end $$;

create or replace function public.update_camp_date(
  p_admin_pin text, p_id uuid, p_start_date date,
  p_end_date date, p_sort_order integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare affected integer;
begin
  if not exists(
    select 1 from settings
    where admin_pin = p_admin_pin
      and p_start_date <= p_end_date
      and p_start_date >= service_start_date
      and p_end_date <= service_end_date
  ) then
    return false;
  end if;

  update camp_dates
  set start_date = p_start_date,
      end_date = p_end_date,
      sort_order = p_sort_order
  where id = p_id;
  get diagnostics affected = row_count;
  return affected = 1;
end $$;

create or replace function public.delete_camp_date(
  p_admin_pin text, p_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare affected integer;
begin
  if not exists(select 1 from settings where admin_pin = p_admin_pin) then
    return false;
  end if;

  delete from camp_dates where id = p_id;
  get diagnostics affected = row_count;
  return affected = 1;
end $$;

-- ---------------------------------------------------------------------------
-- Camp lifecycle and prayer mutation functions
-- ---------------------------------------------------------------------------

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
  if not exists(select 1 from settings where admin_pin = p_admin_pin) then
    return false;
  end if;
  if p_year not between 2000 and 2100 or p_season not in ('여름', '겨울') then
    return false;
  end if;

  insert into camps(year, season) values (p_year, p_season)
  on conflict (year, season) do update set year = excluded.year
  returning id into new_camp_id;

  update settings
  set current_camp_id = new_camp_id,
      camp_year = p_year,
      camp_season = p_season;

  delete from camp_dates;
  return true;
end $$;

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
  if p_new_pin !~ '^[0-9]{6}$'
     or p_role not in ('스탭', '참가자', '기도후원자')
     or cardinality(p_dates) = 0 then
    return false;
  end if;

  update registrations r
  set name = p_name,
      role = p_role,
      church_name = p_church_name,
      prayer_request = p_prayer_request,
      dates = p_dates,
      pin = p_new_pin
  from settings s
  where r.id = p_id
    and r.pin = p_original_pin
    and r.camp_id = s.current_camp_id
    and not exists(
      select 1 from unnest(p_dates) d
      where d < s.service_start_date or d > s.service_end_date
    );
  get diagnostics affected = row_count;
  return affected = 1;
end $$;

create or replace function public.delete_registration(p_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare affected integer;
begin
  delete from registrations r using settings s
  where r.id = p_id
    and r.pin = p_pin
    and r.camp_id = s.current_camp_id;
  get diagnostics affected = row_count;
  return affected = 1;
end $$;

-- ---------------------------------------------------------------------------
-- Prayer read, search and aggregate functions
-- ---------------------------------------------------------------------------

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
  where r.id = p_id and r.pin = p_pin and r.camp_id = s.current_camp_id;
$$;

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
  where r.id = p_id and r.pin = p_pin and r.camp_id <> s.current_camp_id;
$$;

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
  if not exists(select 1 from settings where admin_pin = p_admin_pin) then
    return null;
  end if;

  select count(*) into item_count
  from registrations where camp_id = p_camp_id;

  select coalesce(jsonb_agg(to_jsonb(item)), '[]'::jsonb)
  into result
  from (
    select
      r.id, r.name, r.role, r.church_name, r.prayer_request,
      r.dates, r.created_at, r.camp_id, r.pin
    from registrations r
    where r.camp_id = p_camp_id
    order by r.dates[1] asc nulls last, r.created_at desc
    limit safe_page_size
    offset (safe_page - 1) * safe_page_size
  ) item;

  return jsonb_build_object('items', result, 'total', item_count);
end $$;

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
    where r.camp_id = s.current_camp_id and r.dates @> array[p_date]
    order by r.created_at asc
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

-- ---------------------------------------------------------------------------
-- RLS policies and API privileges
-- ---------------------------------------------------------------------------

alter table public.camps enable row level security;
alter table public.settings enable row level security;
alter table public.registrations enable row level security;
alter table public.camp_dates enable row level security;
alter table public.links enable row level security;

drop policy if exists camps_public_read on public.camps;
create policy camps_public_read on public.camps
  for select to anon, authenticated using (true);

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select to anon, authenticated using (true);

drop policy if exists registrations_public_read on public.registrations;
create policy registrations_public_read on public.registrations
  for select to anon, authenticated using (true);

drop policy if exists registrations_current_insert on public.registrations;
create policy registrations_current_insert on public.registrations
  for insert to anon, authenticated
  with check (
    camp_id = (select current_camp_id from public.settings where id = 1)
    and not exists (
      select 1
      from unnest(dates) d, public.settings s
      where s.id = 1 and (d < s.service_start_date or d > s.service_end_date)
    )
  );

drop policy if exists camp_dates_public_read on public.camp_dates;
create policy camp_dates_public_read on public.camp_dates
  for select to anon, authenticated using (true);

drop policy if exists links_public_read on public.links;
create policy links_public_read on public.links
  for select to anon, authenticated using (true);

revoke all on table public.camps from anon, authenticated;
revoke all on table public.settings from anon, authenticated;
revoke all on table public.registrations from anon, authenticated;
revoke all on table public.camp_dates from anon, authenticated;
revoke all on table public.links from anon, authenticated;

grant select on table public.camps to anon, authenticated;
grant select (
  current_camp_id, camp_year, camp_season, camp_title,
  service_start_date, service_end_date, guide, prayer_points,
  bible_title, bible_content
) on table public.settings to anon, authenticated;
grant select (
  id, name, role, church_name, prayer_request, dates, created_at, camp_id
) on table public.registrations to anon, authenticated;
grant insert (
  name, role, church_name, prayer_request, dates, pin, camp_id, created_at
) on table public.registrations to anon, authenticated;
grant select on table public.camp_dates to anon, authenticated;
grant select on table public.links to anon, authenticated;

revoke all on function public.verify_admin_pin(text) from public;
revoke all on function public.update_setting(integer,text,text,date,date,text,text,text,text,text,text) from public;
revoke all on function public.update_links(text,text,text,text,text,text,text,text) from public;
revoke all on function public.create_camp_date(text,date,date) from public;
revoke all on function public.update_camp_date(text,uuid,date,date,integer) from public;
revoke all on function public.delete_camp_date(text,uuid) from public;
revoke all on function public.start_camp(text,integer,text) from public;
revoke all on function public.update_registration(uuid,text,text,text,text,text,text,date[]) from public;
revoke all on function public.delete_registration(uuid,text) from public;
revoke all on function public.get_current_prayer(uuid,text) from public;
revoke all on function public.get_archived_prayer(uuid,text) from public;
revoke all on function public.get_admin_registrations(text,uuid,integer,integer) from public;
revoke all on function public.search_current_prayers(text,integer) from public;
revoke all on function public.search_archived_prayers(text,integer) from public;
revoke all on function public.get_prayer_month_counts(date,date) from public;
revoke all on function public.get_prayers_by_date(date) from public;
revoke all on function public.list_camps_with_counts() from public;

grant execute on function public.verify_admin_pin(text) to anon, authenticated;
grant execute on function public.update_setting(integer,text,text,date,date,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.update_links(text,text,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.create_camp_date(text,date,date) to anon, authenticated;
grant execute on function public.update_camp_date(text,uuid,date,date,integer) to anon, authenticated;
grant execute on function public.delete_camp_date(text,uuid) to anon, authenticated;
grant execute on function public.start_camp(text,integer,text) to anon, authenticated;
grant execute on function public.update_registration(uuid,text,text,text,text,text,text,date[]) to anon, authenticated;
grant execute on function public.delete_registration(uuid,text) to anon, authenticated;
grant execute on function public.get_current_prayer(uuid,text) to anon, authenticated;
grant execute on function public.get_archived_prayer(uuid,text) to anon, authenticated;
grant execute on function public.get_admin_registrations(text,uuid,integer,integer) to anon, authenticated;
grant execute on function public.search_current_prayers(text,integer) to anon, authenticated;
grant execute on function public.search_archived_prayers(text,integer) to anon, authenticated;
grant execute on function public.get_prayer_month_counts(date,date) to anon, authenticated;
grant execute on function public.get_prayers_by_date(date) to anon, authenticated;
grant execute on function public.list_camps_with_counts() to anon, authenticated;

