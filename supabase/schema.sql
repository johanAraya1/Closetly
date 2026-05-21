-- Closetly Supabase schema
-- Apply with: supabase db push
-- The frontend is intentionally not the source of truth for authorization.

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;
create extension if not exists vector;

do $$
begin
  create type public.visibility_status as enum ('private', 'public', 'trade', 'sale', 'gift');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.subscription_tier as enum ('free', 'premium');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.ai_status as enum ('pending', 'processing', 'complete', 'failed', 'skipped');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_target_type as enum ('user', 'garment', 'outfit', 'message');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_type as enum ('message', 'like', 'trade', 'follow', 'system');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  username citext not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text check (char_length(display_name) <= 80),
  photo_url text,
  bio text check (char_length(bio) <= 300),
  language text not null default 'es' check (language in ('es', 'en')),
  is_private boolean not null default false,
  is_blocked boolean not null default false,
  subscription_tier public.subscription_tier not null default 'free',
  style_preferences jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text check (char_length(name) <= 80),
  image_url text not null,
  thumbnail_url text,
  background_removed_url text,
  category text check (char_length(category) <= 40),
  subcategory text check (char_length(subcategory) <= 60),
  brand text check (char_length(brand) <= 60),
  style text check (char_length(style) <= 40),
  season text check (char_length(season) <= 40),
  material text check (char_length(material) <= 40),
  pattern text check (char_length(pattern) <= 40),
  fit text check (char_length(fit) <= 40),
  gender_style text check (char_length(gender_style) <= 40),
  occasion text check (char_length(occasion) <= 60),
  dominant_palette text[] not null default '{}'::text[],
  color_primary text check (char_length(color_primary) <= 40),
  color_secondary text check (char_length(color_secondary) <= 40),
  visibility public.visibility_status not null default 'private',
  allow_trade boolean not null default false,
  allow_sale boolean not null default false,
  allow_gift boolean not null default false,
  likes_count integer not null default 0 check (likes_count >= 0),
  saves_count integer not null default 0 check (saves_count >= 0),
  wear_count integer not null default 0 check (wear_count >= 0),
  shares_count integer not null default 0 check (shares_count >= 0),
  ai_tags text[] not null default '{}'::text[],
  confidence_score numeric(5,4) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
  embedding_vector vector(1536),
  similarity_hash text,
  ai_status public.ai_status not null default 'pending',
  ai_raw jsonb not null default '{}'::jsonb,
  storage_path text,
  thumbnail_path text,
  processed_path text,
  file_hash text,
  file_size integer check (file_size is null or file_size > 0),
  aspect_ratio numeric(8,4),
  published_at timestamptz,
  last_worn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (
    (allow_trade = false and allow_sale = false and allow_gift = false)
    or visibility in ('public', 'trade', 'sale', 'gift')
  )
);

create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  notes text check (char_length(notes) <= 300),
  season text check (char_length(season) <= 40),
  style_tags text[] not null default '{}'::text[],
  occasion text check (char_length(occasion) <= 60),
  is_public boolean not null default false,
  is_ai_generated boolean not null default false,
  ai_prompt_hash text,
  likes_count integer not null default 0 check (likes_count >= 0),
  saves_count integer not null default 0 check (saves_count >= 0),
  wear_count integer not null default 0 check (wear_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.outfit_garments (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  garment_id uuid not null references public.garments(id) on delete cascade,
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  primary key (outfit_id, garment_id)
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 300),
  visibility public.visibility_status not null default 'private',
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.collection_garments (
  collection_id uuid not null references public.collections(id) on delete cascade,
  garment_id uuid not null references public.garments(id) on delete cascade,
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  primary key (collection_id, garment_id)
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.users(id) on delete cascade,
  garment_id uuid references public.garments(id) on delete set null,
  last_message_preview text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.chat_participants (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  muted_until timestamptz,
  primary key (chat_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 2000),
  attachment_url text,
  status text not null default 'sent' check (status in ('sent', 'delivered', 'read', 'removed')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_id uuid not null,
  target_type public.report_target_type not null,
  reason text not null check (char_length(reason) between 3 and 500),
  metadata jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null check (char_length(title) <= 120),
  body text not null check (char_length(body) <= 240),
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.notification_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('garment', 'outfit', 'collection')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.analytics_events (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete set null,
  event_name text not null check (char_length(event_name) <= 80),
  source text not null default 'mobile' check (source in ('mobile', 'edge', 'system')),
  request_id text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_processing_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  garment_id uuid references public.garments(id) on delete cascade,
  job_type text not null check (job_type in ('analyze_garment', 'remove_background', 'generate_outfit')),
  status public.ai_status not null default 'pending',
  provider text not null default 'openai',
  request_id text,
  input_hash text,
  cost_units integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.rate_limits (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  scope text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, scope, window_start)
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.users(id) on delete set null,
  table_name text not null,
  record_id uuid,
  action text not null,
  request_id text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_username text;
  candidate_username text;
  suffix integer := 0;
begin
  raw_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'));
  if char_length(raw_username) < 3 then
    raw_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  raw_username := left(raw_username, 20);

  candidate_username := raw_username;
  while exists (select 1 from public.users where username = candidate_username) loop
    suffix := suffix + 1;
    candidate_username := left(raw_username, 20) || '_' || suffix::text;
  end loop;

  insert into public.users (id, email, username)
  values (new.id, new.email, candidate_username)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') = 'service_role';
$$;

create or replace function public.is_user_blocked(owner_id uuid, viewer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.blocks b
    where (b.blocker_id = owner_id and b.blocked_id = viewer_id)
       or (b.blocker_id = viewer_id and b.blocked_id = owner_id)
  );
$$;

create or replace function public.can_view_user(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = profile_id
      and u.deleted_at is null
      and (
        u.id = auth.uid()
        or (u.is_private = false and u.is_blocked = false and not public.is_user_blocked(u.id, auth.uid()))
      )
  );
$$;

create or replace function public.can_view_garment(g public.garments)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select g.deleted_at is null
    and (
      g.user_id = auth.uid()
      or (
        g.visibility <> 'private'
        and public.can_view_user(g.user_id)
      )
    );
$$;

create or replace function public.is_chat_participant(chat_uuid uuid, participant_uuid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_participants cp
    join public.chats c on c.id = cp.chat_id
    where cp.chat_id = chat_uuid
      and cp.user_id = participant_uuid
      and c.deleted_at is null
  );
$$;

create or replace function public.check_rate_limit(p_scope text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  if v_user_id is null then
    return false;
  end if;

  insert into public.rate_limits (user_id, scope, window_start, request_count)
  values (v_user_id, p_scope, v_window, 1)
  on conflict (user_id, scope, window_start)
  do update set request_count = public.rate_limits.request_count + 1, updated_at = now()
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

create or replace function public.touch_chat_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chats
  set last_message_preview = left(new.text, 160),
      last_message_at = new.created_at,
      updated_at = now()
  where id = new.chat_id;

  insert into public.notifications (user_id, type, title, body, data)
  select cp.user_id, 'message', 'Closetly', left(new.text, 160), jsonb_build_object('chat_id', new.chat_id)
  from public.chat_participants cp
  where cp.chat_id = new.chat_id
    and cp.user_id <> new.sender_id;

  return new;
end;
$$;

drop trigger if exists messages_touch_chat on public.messages;
create trigger messages_touch_chat
after insert on public.messages
for each row execute function public.touch_chat_on_message();

create or replace function public.sync_favorite_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.target_type = 'garment' then
    update public.garments set saves_count = saves_count + 1 where id = new.target_id;
  elsif tg_op = 'DELETE' and old.target_type = 'garment' then
    update public.garments set saves_count = greatest(saves_count - 1, 0) where id = old.target_id;
  elsif tg_op = 'INSERT' and new.target_type = 'outfit' then
    update public.outfits set saves_count = saves_count + 1 where id = new.target_id;
  elsif tg_op = 'DELETE' and old.target_type = 'outfit' then
    update public.outfits set saves_count = greatest(saves_count - 1, 0) where id = old.target_id;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists favorites_sync_counts_insert on public.favorites;
create trigger favorites_sync_counts_insert
after insert on public.favorites
for each row execute function public.sync_favorite_counts();

drop trigger if exists favorites_sync_counts_delete on public.favorites;
create trigger favorites_sync_counts_delete
after delete on public.favorites
for each row execute function public.sync_favorite_counts();

create or replace function public.audit_basic_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, table_name, record_id, action, request_id)
  values (
    auth.uid(),
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    current_setting('request.headers', true)::jsonb->>'x-request-id'
  );
  return coalesce(new, old);
exception when others then
  return coalesce(new, old);
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['users','garments','outfits','collections','chats','notification_devices','ai_processing_jobs','rate_limits']
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

drop trigger if exists garments_audit_change on public.garments;
create trigger garments_audit_change
after update or delete on public.garments
for each row execute function public.audit_basic_change();

drop trigger if exists messages_audit_change on public.messages;
create trigger messages_audit_change
after update or delete on public.messages
for each row execute function public.audit_basic_change();

-- Query-focused indexes
create index if not exists users_username_trgm_idx on public.users using gin ((username::text) gin_trgm_ops);
create index if not exists users_public_idx on public.users (created_at desc) where deleted_at is null and is_private = false;
create index if not exists blocks_blocked_idx on public.blocks (blocked_id, blocker_id);

create unique index if not exists garments_user_file_hash_active_idx
  on public.garments (user_id, file_hash)
  where deleted_at is null and file_hash is not null;
create index if not exists garments_user_active_idx on public.garments (user_id, created_at desc) where deleted_at is null;
create index if not exists garments_public_feed_idx on public.garments (created_at desc, id) where deleted_at is null and visibility <> 'private';
create index if not exists garments_category_idx on public.garments (category) where deleted_at is null;
create index if not exists garments_visibility_idx on public.garments (visibility, created_at desc) where deleted_at is null;
create index if not exists garments_palette_gin_idx on public.garments using gin (dominant_palette);
create index if not exists garments_ai_tags_gin_idx on public.garments using gin (ai_tags);
create index if not exists garments_embedding_idx on public.garments using ivfflat (embedding_vector vector_cosine_ops) with (lists = 100) where embedding_vector is not null;

create index if not exists outfits_user_active_idx on public.outfits (user_id, created_at desc) where deleted_at is null;
create index if not exists outfits_public_idx on public.outfits (created_at desc, id) where deleted_at is null and is_public = true;
create index if not exists outfit_garments_garment_idx on public.outfit_garments (garment_id);

create index if not exists collections_user_active_idx on public.collections (user_id, created_at desc) where deleted_at is null;
create index if not exists collection_garments_garment_idx on public.collection_garments (garment_id);

create index if not exists chats_last_message_idx on public.chats (last_message_at desc nulls last) where deleted_at is null;
create index if not exists chat_participants_user_idx on public.chat_participants (user_id, chat_id);
create index if not exists messages_chat_created_idx on public.messages (chat_id, created_at desc) where deleted_at is null;

create index if not exists reports_target_idx on public.reports (target_type, target_id, created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;
create index if not exists favorites_target_idx on public.favorites (target_type, target_id, created_at desc);
create index if not exists follows_following_idx on public.follows (following_id, created_at desc);
create index if not exists analytics_events_user_time_idx on public.analytics_events (user_id, created_at desc);
create index if not exists analytics_events_name_time_idx on public.analytics_events (event_name, created_at desc);
create index if not exists ai_jobs_user_type_idx on public.ai_processing_jobs (user_id, job_type, created_at desc);
create index if not exists rate_limits_window_idx on public.rate_limits (scope, window_start desc);
create index if not exists audit_logs_table_time_idx on public.audit_logs (table_name, created_at desc);

create or replace view public.public_garments_feed
with (security_invoker = true)
as
select
  g.id,
  g.user_id,
  g.thumbnail_url,
  g.background_removed_url,
  g.category,
  g.style,
  g.season,
  g.color_primary,
  g.color_secondary,
  g.visibility,
  g.likes_count,
  g.saves_count,
  g.created_at
from public.garments g
join public.users u on u.id = g.user_id
where g.deleted_at is null
  and g.visibility <> 'private'
  and u.deleted_at is null
  and u.is_private = false
  and u.is_blocked = false;

-- Storage buckets: private originals, public thumbnails, public processed images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('garment-originals', 'garment-originals', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('garment-thumbnails', 'garment-thumbnails', true, 1048576, array['image/webp','image/jpeg','image/png']),
  ('garment-processed', 'garment-processed', true, 2097152, array['image/webp','image/png'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Row level security
alter table public.users enable row level security;
alter table public.blocks enable row level security;
alter table public.garments enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_garments enable row level security;
alter table public.collections enable row level security;
alter table public.collection_garments enable row level security;
alter table public.chats enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_devices enable row level security;
alter table public.favorites enable row level security;
alter table public.follows enable row level security;
alter table public.analytics_events enable row level security;
alter table public.ai_processing_jobs enable row level security;
alter table public.rate_limits enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists users_select_visible on public.users;
create policy users_select_visible on public.users
for select using (public.can_view_user(id) or id = auth.uid());

drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users
for insert with check (id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists blocks_manage_self on public.blocks;
create policy blocks_manage_self on public.blocks
for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

drop policy if exists garments_select_visible on public.garments;
create policy garments_select_visible on public.garments
for select using (
  deleted_at is null
  and (
    user_id = auth.uid()
    or (visibility <> 'private' and public.can_view_user(user_id))
  )
);

drop policy if exists garments_insert_self on public.garments;
create policy garments_insert_self on public.garments
for insert with check (user_id = auth.uid());

drop policy if exists garments_update_self on public.garments;
create policy garments_update_self on public.garments
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists garments_delete_self on public.garments;
create policy garments_delete_self on public.garments
for delete using (user_id = auth.uid());

drop policy if exists outfits_select_visible on public.outfits;
create policy outfits_select_visible on public.outfits
for select using (deleted_at is null and (user_id = auth.uid() or is_public = true));

drop policy if exists outfits_insert_self on public.outfits;
create policy outfits_insert_self on public.outfits
for insert with check (user_id = auth.uid());

drop policy if exists outfits_update_self on public.outfits;
create policy outfits_update_self on public.outfits
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists outfits_delete_self on public.outfits;
create policy outfits_delete_self on public.outfits
for delete using (user_id = auth.uid());

drop policy if exists outfit_garments_select_visible on public.outfit_garments;
create policy outfit_garments_select_visible on public.outfit_garments
for select using (
  exists (
    select 1 from public.outfits o
    where o.id = outfit_id and (o.user_id = auth.uid() or o.is_public = true)
  )
);

drop policy if exists outfit_garments_owner_write on public.outfit_garments;
create policy outfit_garments_owner_write on public.outfit_garments
for all using (
  exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid())
) with check (
  exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid())
  and exists (select 1 from public.garments g where g.id = garment_id and g.user_id = auth.uid())
);

drop policy if exists collections_select_visible on public.collections;
create policy collections_select_visible on public.collections
for select using (deleted_at is null and (user_id = auth.uid() or visibility <> 'private'));

drop policy if exists collections_owner_write on public.collections;
create policy collections_owner_write on public.collections
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists collection_garments_select_visible on public.collection_garments;
create policy collection_garments_select_visible on public.collection_garments
for select using (
  exists (
    select 1 from public.collections c
    where c.id = collection_id and (c.user_id = auth.uid() or c.visibility <> 'private')
  )
);

drop policy if exists collection_garments_owner_write on public.collection_garments;
create policy collection_garments_owner_write on public.collection_garments
for all using (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);

drop policy if exists chats_select_participant on public.chats;
create policy chats_select_participant on public.chats
for select using (public.is_chat_participant(id));

drop policy if exists chats_insert_creator on public.chats;
create policy chats_insert_creator on public.chats
for insert with check (created_by = auth.uid());

drop policy if exists chats_update_participant on public.chats;
create policy chats_update_participant on public.chats
for update using (public.is_chat_participant(id)) with check (public.is_chat_participant(id));

drop policy if exists chat_participants_select_self_chat on public.chat_participants;
create policy chat_participants_select_self_chat on public.chat_participants
for select using (public.is_chat_participant(chat_id));

drop policy if exists chat_participants_insert_creator on public.chat_participants;
create policy chat_participants_insert_creator on public.chat_participants
for insert with check (
  exists (select 1 from public.chats c where c.id = chat_id and c.created_by = auth.uid())
  or user_id = auth.uid()
);

drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant on public.messages
for select using (deleted_at is null and public.is_chat_participant(chat_id));

drop policy if exists messages_insert_participant on public.messages;
create policy messages_insert_participant on public.messages
for insert with check (sender_id = auth.uid() and public.is_chat_participant(chat_id));

drop policy if exists messages_update_sender on public.messages;
create policy messages_update_sender on public.messages
for update using (sender_id = auth.uid()) with check (sender_id = auth.uid());

drop policy if exists reports_insert_self on public.reports;
create policy reports_insert_self on public.reports
for insert with check (reporter_id = auth.uid());

drop policy if exists reports_service_select on public.reports;
create policy reports_service_select on public.reports
for select using (public.is_service_role());

drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self on public.notifications
for select using (user_id = auth.uid());

drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notification_devices_owner on public.notification_devices;
create policy notification_devices_owner on public.notification_devices
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists favorites_select_self on public.favorites;
create policy favorites_select_self on public.favorites
for select using (user_id = auth.uid());

drop policy if exists favorites_insert_self on public.favorites;
create policy favorites_insert_self on public.favorites
for insert with check (
  user_id = auth.uid()
  and (
    (target_type = 'garment' and exists (select 1 from public.garments g where g.id = target_id and public.can_view_garment(g)))
    or (target_type = 'outfit' and exists (select 1 from public.outfits o where o.id = target_id and (o.user_id = auth.uid() or o.is_public)))
    or target_type = 'collection'
  )
);

drop policy if exists favorites_delete_self on public.favorites;
create policy favorites_delete_self on public.favorites
for delete using (user_id = auth.uid());

drop policy if exists follows_select_visible on public.follows;
create policy follows_select_visible on public.follows
for select using (follower_id = auth.uid() or following_id = auth.uid());

drop policy if exists follows_insert_self on public.follows;
create policy follows_insert_self on public.follows
for insert with check (follower_id = auth.uid() and public.can_view_user(following_id));

drop policy if exists follows_delete_self on public.follows;
create policy follows_delete_self on public.follows
for delete using (follower_id = auth.uid());

drop policy if exists analytics_insert_self on public.analytics_events;
create policy analytics_insert_self on public.analytics_events
for insert with check (user_id = auth.uid());

drop policy if exists analytics_service_select on public.analytics_events;
create policy analytics_service_select on public.analytics_events
for select using (public.is_service_role());

drop policy if exists ai_jobs_select_self on public.ai_processing_jobs;
create policy ai_jobs_select_self on public.ai_processing_jobs
for select using (user_id = auth.uid());

drop policy if exists ai_jobs_service_all on public.ai_processing_jobs;
create policy ai_jobs_service_all on public.ai_processing_jobs
for all using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists rate_limits_service_all on public.rate_limits;
create policy rate_limits_service_all on public.rate_limits
for all using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists audit_logs_service_select on public.audit_logs;
create policy audit_logs_service_select on public.audit_logs
for select using (public.is_service_role());

-- Storage policies
drop policy if exists garment_originals_read_own on storage.objects;
create policy garment_originals_read_own on storage.objects
for select using (
  bucket_id = 'garment-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists garment_originals_write_own on storage.objects;
create policy garment_originals_write_own on storage.objects
for insert with check (
  bucket_id = 'garment-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists garment_originals_update_own on storage.objects;
create policy garment_originals_update_own on storage.objects
for update using (
  bucket_id = 'garment-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'garment-originals'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists garment_thumbnails_read_public on storage.objects;
create policy garment_thumbnails_read_public on storage.objects
for select using (bucket_id = 'garment-thumbnails');

drop policy if exists garment_thumbnails_write_own on storage.objects;
create policy garment_thumbnails_write_own on storage.objects
for insert with check (
  bucket_id = 'garment-thumbnails'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists garment_processed_read_public on storage.objects;
create policy garment_processed_read_public on storage.objects
for select using (bucket_id = 'garment-processed');

drop policy if exists garment_processed_service_write on storage.objects;
create policy garment_processed_service_write on storage.objects
for insert with check (bucket_id = 'garment-processed' and public.is_service_role());
