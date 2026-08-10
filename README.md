# JagX Connect — Brand Redesign, Step 1: the color/gradient foundation

## What this round does
Landed the actual visual language from your reference board as **global
tokens** — meaning it applies everywhere at once, not page by page:

- New default dark-mode background/surface: deep violet-black instead of
  neutral near-black
- New primary brand color: a violet → magenta gradient, replacing gold as
  the default for buttons, active nav, the create-post FAB
- Gold is **kept**, not removed — it now specifically means "premium /
  rank / wallet / leaderboard," exactly like your reference board uses it
  (gold crowns and trophies sitting inside an otherwise violet/magenta app)
- Story rings now use a vivid violet → magenta → gold conic gradient
  instead of plain gold, matching the colorful rings in your reference

## Why this first, not a specific screen
Every page in your app already uses these same shared classes
(`.gold-gradient`, `text-gold`, story rings, bottom nav). By changing the
foundation first, **the whole app shifts toward the new look immediately** —
Live, Chat, Profile, Settings, Leaderboard, all of it — before I touch a
single page's layout. Screen-by-screen structural work (photo-forward post
cards, the VIP live room layout, etc.) builds on top of this next.

## Being honest about the size of what's left
Your reference board shows 21 screen types. Of those:
- **Already exist in your app**, need restyling to match: Home, Live,
  Chat, Profile, Settings, Auth, Leaderboard, Notifications
- **Don't exist yet at all**, need building from scratch: Reels/Shorts,
  Marketplace, standalone Wallet page, Events/Calendar, Discovery page,
  Groups/Communities hub, Bookmarks/Saved, a dedicated JagX AI hub page

That second list is a lot of new product, not redesign — each is its own
real scope of work (data model, backend, UI). I'll keep working through
this systematically, but wanted to be upfront rather than imply this is a
quick pass.

## Apply via Termux
```
cd ~
rm -rf jagx-updates
unzip -o jagx-connect-mobile-ready-1.zip
cat jagx-updates/VERSION.txt   # must say "round: BRAND-REDESIGN-1"
cp jagx-updates/src/index.css quick-social-preview-c265dea0-main/src/index.css
cp jagx-updates/src/components/*.tsx quick-social-preview-c265dea0-main/src/components/
cd quick-social-preview-c265dea0-main
git status
git add .
git commit -m "brand redesign step 1: violet/magenta color foundation"
git push
```
No SQL patch this round — pure frontend styling.

## What's next
Tell me which existing page to restyle first to match the reference layout
(not just colors) — Home feed is the obvious highest-traffic choice, but
it's your call.
