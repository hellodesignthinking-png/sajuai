import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App';

// Self-heal stale PWA caches. When env/config (e.g. VITE_SUPABASE_URL) changes
// between deploys, old service workers can keep serving a bundle with the
// wrong values baked in. This bumps a local "SW generation" and, when we see
// a new build, wipes caches + reloads once so the user always gets fresh JS.
const SW_GEN_KEY = 'sajuai_sw_gen';
const CURRENT_GEN = '2026-04-21a';
if ('serviceWorker' in navigator) {
  try {
    const prev = localStorage.getItem(SW_GEN_KEY);
    if (prev !== CURRENT_GEN) {
      localStorage.setItem(SW_GEN_KEY, CURRENT_GEN);
      if (prev !== null) {
        // Only force-reload if there was a previous generation — avoids an
        // infinite loop on first visit.
        navigator.serviceWorker.getRegistrations().then(async (regs) => {
          await Promise.all(regs.map((r) => r.unregister()));
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
          window.location.reload();
        }).catch(() => { /* best-effort */ });
      }
    }
  } catch {
    // localStorage blocked — skip self-heal
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
