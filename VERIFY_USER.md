# Verify a user (add the gold ✓ badge)

JagX uses a simple boolean flag on `profiles.is_verified`. Turning it on shows
the gold ✓ badge everywhere their name appears — feed, discover, DM header,
profile page, live viewers, followers list, etc. **The badge updates in real
time** because every screen reads `is_verified` when it loads the profile.

## Option A — from the Admin Panel (recommended)

1. Sign in as an admin user (a row in `user_roles` with `role = 'admin'`).
2. Go to `/admin` in the app.
3. Find the user in the Users list and click the green **Verify** button.

That's it — the badge appears immediately for everyone on their next refresh.

## Option B — direct SQL for `uchechiumeakuta02@gmail.com`

If you don't yet have an admin account, run this in the Supabase SQL editor:

```sql
UPDATE public.profiles
   SET is_verified = true
 WHERE user_id = (
   SELECT id FROM auth.users WHERE lower(email) = 'uchechiumeakuta02@gmail.com'
 );
```

To unverify:

```sql
UPDATE public.profiles SET is_verified = false
 WHERE user_id = (SELECT id FROM auth.users WHERE lower(email) = 'uchechiumeakuta02@gmail.com');
```

## Real-time "email confirmed" (different thing)

If instead you want to force-confirm their email (so they can log in without
clicking the confirmation link):

```sql
UPDATE auth.users
   SET email_confirmed_at = now()
 WHERE lower(email) = 'uchechiumeakuta02@gmail.com';
```