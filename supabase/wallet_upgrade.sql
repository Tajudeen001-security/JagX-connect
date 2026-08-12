-- ═══════════════════════════════════════════════════════════════
-- JagX Connect — real coin wallet
-- Run this after schema.sql and messages_upgrade.sql. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists coins int not null default 2500;

-- Users can only ever update their OWN coin balance, never anyone else's
drop policy if exists "Users can update their own coin balance" on public.profiles;
create policy "Users can update their own coin balance"
  on public.profiles for update using (auth.uid() = id);

-- Give new signups a starting balance automatically (updates the trigger
-- from schema.sql to also set coins on account creation)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle, display_name, avatar_url, coins)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    2500
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Let the app react live if your balance changes from another device/tab
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end;
$$;
