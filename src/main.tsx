import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

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
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
