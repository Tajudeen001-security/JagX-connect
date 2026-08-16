import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { supabase } from './lib/supabase'

// On a real installed app (not a browser tab), color the status bar and
// let the app draw underneath it instead of leaving a plain OS black bar
// at the top — this is the "looks like a real app, not a webpage" fix.
if (Capacitor.isNativePlatform()) {
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setOverlaysWebView({ overlay: true });
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#0B0C10' }).catch(() => {
      // setBackgroundColor is Android-only and throws on iOS; safe to ignore
    });
  });

  // Catch the OAuth redirect coming back into the app as aural://login-callback
  // (used because this app has no public domain — see App plugin listener below)
  Promise.all([import('@capacitor/app'), import('@capacitor/browser')]).then(
    ([{ App: CapApp }, { Browser }]) => {
      CapApp.addListener('appUrlOpen', async ({ url }) => {
        if (!url.startsWith('aural://login-callback')) return;
        try {
          await Browser.close();
        } catch {
          // Browser may already be closed; safe to ignore
        }
        // Supabase puts the session tokens in the URL fragment (#access_token=...)
        const hash = url.split('#')[1];
        if (!hash) return;
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          // The app's own onAuthStateChange listener (in App.tsx) picks up
          // the new session from here and logs the user in.
        }
      });
    }
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
