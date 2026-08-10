# JagX Connect — Android & iOS App Setup (Capacitor)

This turns your existing website into real Android and iOS apps, using the
**exact same Supabase project** (`fwjxhozxlucaywpavznu`) — same users, same
posts, same everything. Nothing about your backend changes.

I've already added to this project:
- `capacitor.config.ts`
- Capacitor packages in `package.json`
- A safer native session-storage adapter in `src/integrations/supabase/client.ts`

You just need to run these commands on your own machine (this can't be done
inside a sandboxed chat, since it needs internet access + Android Studio /
Xcode installed).

## 0. Requirements
- Node.js 18+ installed
- VS Code
- **Android:** Android Studio installed (for the emulator + SDK)
- **iOS:** a Mac with Xcode installed (Apple doesn't allow building iOS apps
  on Windows/Linux — this is an Apple rule, not a Capacitor limitation)

## 1. Open the project and install dependencies
```bash
cd jagx-connect        # wherever you unzip this folder
npm install
```

## 2. Build the web app
```bash
npm run build
```
This creates the `dist/` folder that Capacitor will wrap into the native apps.

## 3. Add the native platforms (one-time)
```bash
npx cap add android
npx cap add ios
```
This generates an `android/` folder and an `ios/` folder — these are real
native projects. Commit them to git; they're normal to check in.

## 4. Sync your web build into the native projects
Do this every time you change your code:
```bash
npm run cap:sync
```

## 5. Open and run
```bash
npm run cap:android   # opens Android Studio -> click Run ▶
npm run cap:ios        # opens Xcode (Mac only) -> click Run ▶
```

## About your data
- Same Supabase URL + anon key as your website — already wired in
  `src/integrations/supabase/client.ts`. No new project, no migration.
- All existing users, posts, follows, DMs, etc. are already there and will
  show up immediately in the app.
- Login sessions on native now persist via `@capacitor/preferences` (more
  reliable than plain `localStorage` inside a WebView), with automatic
  fallback to `localStorage` on the regular website — so the website's
  behavior is unchanged.

## Icons & splash screen
Capacitor needs a 1024x1024 app icon and a splash image. Easiest way:
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0a0a0a' --splashBackgroundColor '#0a0a0a'
```
Put your source icon at `resources/icon.png` (1024x1024) first.

## Push notifications (optional, later)
You already use Firebase for web push (`public/firebase-messaging-sw.js`).
For native push you'd add `@capacitor/push-notifications` and wire it to the
same Firebase project — happy to help with that as a follow-up once the
basic apps are running.

## Publishing
- **Android:** build a signed `.aab` in Android Studio → upload to Google Play Console.
- **iOS:** build & archive in Xcode → upload via Xcode/Transporter to App Store Connect (needs an Apple Developer account, $99/year).
