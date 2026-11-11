// Client boundary: service worker registration runs in the browser only.
'use client';

import { useEffect } from 'react';

/**
 * Registers `/sw.js` in production builds. Development skips it so cached
 * pages never hide a code change.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(() => undefined);
  }, []);
  return null;
}
