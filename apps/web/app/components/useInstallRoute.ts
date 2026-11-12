// Client boundary: install support depends on browser events and media queries.
'use client';

import { useEffect, useRef, useState } from 'react';

import {
  detectInstallRoute,
  installRouteEvent,
  markAppInstalled,
  type InstallRoute,
} from '@/lib/pwa/install';

/** Tracks how this browser can install the app, and hides the route once it is installed. */
export function useInstallRoute(): InstallRoute {
  const [route, setRoute] = useState<InstallRoute>('none');
  const installed = useRef(false);

  useEffect(() => {
    const update = () => setRoute(installed.current ? 'none' : detectInstallRoute());
    const installedNow = () => {
      installed.current = true;
      markAppInstalled();
      setRoute('none');
    };
    update();
    window.addEventListener(installRouteEvent, update);
    window.addEventListener('appinstalled', installedNow);
    return () => {
      window.removeEventListener(installRouteEvent, update);
      window.removeEventListener('appinstalled', installedNow);
    };
  }, []);

  return route;
}
