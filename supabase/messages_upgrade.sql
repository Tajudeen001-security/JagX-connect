-- ═══════════════════════════════════════════════════════════════
-- JagX Connect — DM upgrade: PIN-encrypted + auto-destroy messages
-- Run this AFTER schema.sql (it only adds to what's already there).
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- Add the columns the chat UI actually uses (matches the `Message`
-- interface in App.tsx exactly)
alter table public.messages add column if not exists is_encrypted boolean not null default false;
alter table public.messages add column if not exists pin_code text;
alter table public.messages add column if not exists expires_at timestamptz;
alter table public.messages add column if not exists auto_destroy_duration int; -- seconds

-- NOTE: tapCount / isRevealed from the Message interface are NOT stored
-- here on purpose — those track whether *you* have tapped to reveal a
-- PIN-locked message on *your* screen right now. That's per-viewer,
-- per-session UI state, not a fact about the message itself, so it
-- stays in React state client-side, same as today.

-- Index so expired-message cleanup (below) is fast even with a lot of messages
create index if not exists messages_expires_at_idx
  on public.messages (expires_at)
  where expires_at is not null;

-- ─────────────────────────────────────────────────────────────
-- Real auto-destroy: without this, "expires_at" is just a label the
-- app checks and hides — the message still sits in your database
-- forever, readable by anyone with DB access. This actually deletes
-- expired rows server-side every minute.
-- ─────────────────────────────────────────────────────────────

create or replace function public.delete_expired_messages()
returns void as $$
begin
  delete from public.messages
  where expires_at is not null and expires_at <= now();
end;
$$ language plpgsql security definer;

-- Requires the pg_cron extension. On Supabase: Dashboard → Database →
-- Extensions → search "pg_cron" → Enable. Available on all plans.
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'delete-expired-messages') then
    perform cron.unschedule('delete-expired-messages');
  end if;

  perform cron.schedule(
    'delete-expired-messages',
    '* * * * *', -- every minute
    $cron$ select public.delete_expired_messages(); $cron$
  );
end;
$$;
