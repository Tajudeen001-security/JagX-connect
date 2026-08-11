-- Run this in Supabase Dashboard → SQL Editor → New query → paste all → Run.
-- This matches the exact fields src/App.tsx already expects (Post, CommentItem,
-- AppNotification interfaces), so once you wire the fetch calls it'll work
-- without reshaping data client-side.

-- 1. Profiles (one row per signed-up user, auto-created on signup)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

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
  );
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

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = author_id);

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

create policy "Comments are viewable by everyone"
  on public.post_comments for select using (true);

create policy "Users can insert their own comments"
  on public.post_comments for insert with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.post_comments for delete using (auth.uid() = author_id);

-- 4. Notifications (matches `AppNotification`) — private, per-user
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  desc text not null,
  type text not null check (type in ('like', 'gift', 'comment', 'system')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view only their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update only their own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- 5. Storage bucket for post photos/videos (public read, owner-only write)
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

create policy "Anyone can view post media"
  on storage.objects for select using (bucket_id = 'post-media');

create policy "Users can upload their own post media"
  on storage.objects for insert
  with check (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own post media"
  on storage.objects for delete
  using (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Live stream chat (broadcast — ephemeral, not stored, see App.tsx)
-- No table needed: live chat uses supabase.channel(...).on('broadcast', ...)
-- which is peer-to-peer through Supabase's realtime server and doesn't
-- write to Postgres at all. Nothing to run here for that part.

-- 7. Turn on realtime so new posts/comments/notifications push to the app
-- live instead of needing a refresh
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_comments;
alter publication supabase_realtime add table public.notifications;
