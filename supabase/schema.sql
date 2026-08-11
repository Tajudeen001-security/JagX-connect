-- ═══════════════════════════════════════════════════════════════
-- JagX Connect — full Supabase setup
-- Run this in Supabase Dashboard → SQL Editor → New query → paste
-- ALL of this → Run. Safe to re-run (every statement is idempotent).
-- ═══════════════════════════════════════════════════════════════

-- 1. Profiles (one row per signed-up user, auto-created on signup)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Posts (matches the `Post` interface in App.tsx)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  author_handle text not null,
  author_avatar text,
  content text not null,
  image_url text,
  video_url text,
  likes_count int not null default 0,
  comments_count int not null default 0,
  gifts_count int not null default 0,
  is_sponsored boolean not null default false,
  language text default 'en',
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "Posts are viewable by everyone" on public.posts;
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

drop policy if exists "Users can insert their own posts" on public.posts;
create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = author_id);

drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = author_id);

drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = author_id);

-- 3. Comments (matches `CommentItem`)
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  author_avatar text,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

drop policy if exists "Comments are viewable by everyone" on public.post_comments;
create policy "Comments are viewable by everyone"
  on public.post_comments for select using (true);

drop policy if exists "Users can insert their own comments" on public.post_comments;
create policy "Users can insert their own comments"
  on public.post_comments for insert with check (auth.uid() = author_id);

drop policy if exists "Users can delete their own comments" on public.post_comments;
create policy "Users can delete their own comments"
  on public.post_comments for delete using (auth.uid() = author_id);

-- 4. Notifications (matches `AppNotification`) — private, per-user
-- NOTE: the column is "description", not "desc" — `desc` is a reserved
-- SQL keyword (used in ORDER BY ... DESC) and breaks as a bare column name.
-- This is exactly what your last run failed on.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  type text not null check (type in ('like', 'gift', 'comment', 'system')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view only their own notifications" on public.notifications;
create policy "Users can view only their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update only their own notifications" on public.notifications;
create policy "Users can update only their own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- 5. Marketplace listings (matches `Product`)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  seller_name text not null,
  title text not null,
  description text not null,
  price_coins int not null default 0,
  price_usd numeric(10,2) not null default 0,
  category text not null default 'general',
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Listings are viewable by everyone" on public.products;
create policy "Listings are viewable by everyone"
  on public.products for select using (true);

drop policy if exists "Users can insert their own listings" on public.products;
create policy "Users can insert their own listings"
  on public.products for insert with check (auth.uid() = seller_id);

drop policy if exists "Users can delete their own listings" on public.products;
create policy "Users can delete their own listings"
  on public.products for delete using (auth.uid() = seller_id);

-- 6. Direct message conversations (matches `Conversation`)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_timestamp timestamptz not null default now(),
  unique (user_a, user_b)
);

alter table public.conversations enable row level security;

drop policy if exists "Users can view their own conversations" on public.conversations;
create policy "Users can view their own conversations"
  on public.conversations for select using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can create conversations they're part of" on public.conversations;
create policy "Users can create conversations they're part of"
  on public.conversations for insert with check (auth.uid() = user_a or auth.uid() = user_b);

-- 7. Direct messages (matches `Message`)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  audio_url text,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "Users can view messages in their conversations" on public.messages;
create policy "Users can view messages in their conversations"
  on public.messages for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

drop policy if exists "Users can send messages in their conversations" on public.messages;
create policy "Users can send messages in their conversations"
  on public.messages for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- 8. Storage bucket for post/product photos & videos (public read, owner-only write)
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view post media" on storage.objects;
create policy "Anyone can view post media"
  on storage.objects for select using (bucket_id = 'post-media');

drop policy if exists "Users can upload their own post media" on storage.objects;
create policy "Users can upload their own post media"
  on storage.objects for insert
  with check (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their own post media" on storage.objects;
create policy "Users can delete their own post media"
  on storage.objects for delete
  using (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);

-- 9. Live stream chat — no table needed. It uses
-- supabase.channel(...).on('broadcast', ...) which is peer-to-peer
-- through Supabase's realtime server and never touches Postgres.

-- 10. Turn on realtime so posts/comments/notifications/DMs push to the
-- app live instead of needing a refresh
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_comments;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.messages;
