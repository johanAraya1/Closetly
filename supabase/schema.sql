-- Closetly SQL schema for Supabase

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default auth.uid(),
  email text not null unique,
  username text not null unique,
  photo_url text,
  bio text,
  language text not null default 'es',
  is_private boolean not null default false,
  style_preferences jsonb default '{}'::jsonb,
  blocked_users uuid[] default array[]::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  image_url text not null,
  thumbnail_url text,
  name text,
  category text,
  subcategory text,
  brand text,
  color_primary text,
  color_secondary text,
  dominant_palette text[],
  detected_type text,
  confidence_score numeric,
  style_tags text[],
  season text,
  material text,
  pattern text,
  background_removed_url text,
  visibility text not null default 'private',
  allow_trade boolean not null default false,
  allow_gift boolean not null default false,
  allow_sale boolean not null default false,
  likes_count integer not null default 0,
  saves_count integer not null default 0,
  wear_count integer not null default 0,
  last_worn_date date,
  embedding_vector vector(1536),
  similarity_hash text,
  storage_path text,
  file_size integer,
  aspect_ratio numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists garments_user_id_idx on garments(user_id);
create index if not exists garments_visibility_idx on garments(visibility);
create index if not exists garments_category_idx on garments(category);
create index if not exists garments_style_tags_idx on garments using gin(style_tags);
create index if not exists garments_dominant_palette_idx on garments using gin(dominant_palette);
create index if not exists garments_embedding_vector_idx on garments using ivfflat(embedding_vector) with (lists = 100);

create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  season text,
  style_tags text[],
  is_public boolean not null default false,
  likes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outfits_user_id_idx on outfits(user_id);
create index if not exists outfits_is_public_idx on outfits(is_public);
create index if not exists outfits_style_tags_idx on outfits using gin(style_tags);

create table if not exists outfit_garments (
  outfit_id uuid references outfits(id) on delete cascade,
  garment_id uuid references garments(id) on delete cascade,
  primary key (outfit_id, garment_id)
);

create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_participants (
  chat_id uuid references chats(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  sender_id uuid references users(id) on delete cascade,
  text text not null,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create index if not exists messages_chat_id_created_at_idx on messages(chat_id, created_at desc);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references users(id) on delete cascade,
  target_id uuid not null,
  target_type text not null,
  type text not null,
  reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS activation
alter table users enable row level security;
alter table garments enable row level security;
alter table outfits enable row level security;
alter table outfit_garments enable row level security;
alter table chats enable row level security;
alter table chat_participants enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;

-- Additional indexes for search and feed
create index if not exists users_username_idx on users(lower(username));
create index if not exists users_is_private_idx on users(is_private);

-- Example policies are declared separately in policies.md and edge functions.
