// Client boundary: install support depends on browser events, media queries, and local storage.
'use client';

import { useEffect, useId, useState } from 'react';
import { Share } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { InstallCopy } from '@/lib/content/strings';
import {
  detectInstallRoute,
  installAvailableEvent,
  isInstallPromptSnoozed,
  snoozeInstallPrompt,
  type InstallRoute,
} from '@/lib/pwa/install';

import { floatingCardClass } from './experience/Tour';

/** Delay before the prompt appears, so it never interrupts the moment a screen opens. */
const showDelayMs = 1500;

/**
 * Invites a phone visitor to add the app to the home screen. It appears once the
 * visitor has left the opening cover, only while `allowed` is true, and stays away
 * for two weeks after "Not now".
 */
export function InstallPrompt({ copy, allowed }: { copy: InstallCopy; allowed: boolean }) {
  const titleId = useId();
  const [route, setRoute] = useState<InstallRoute>('none');
  const [dismissed, setDismissed] = useState(true);
  const [armed, setArmed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const update = () => setRoute(detectInstallRoute());
    const installed = () => setRoute('none');
    update();
    setDismissed(isInstallPromptSnoozed());
    window.addEventListener(installAvailableEvent, update);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener(installAvailableEvent, update);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  useEffect(() => {
    if (!allowed || armed) return;
    const timer = window.setTimeout(() => setArmed(true), showDelayMs);
    return () => window.clearTimeout(timer);
  }, [allowed, armed]);

  if (route === 'none' || dismissed || !armed || !allowed) return null;

  const notNow = () => {
    snoozeInstallPrompt();
    setDismissed(true);
  };

  const install = async () => {
    const event = window.__calmInstallPrompt;
    if (!event) {
      setRoute(detectInstallRoute());
      return;
    }
    setInstalling(true);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome !== 'accepted') snoozeInstallPrompt();
    } finally {
      // The browser allows one prompt per event; a new event arrives if it offers again.
      window.__calmInstallPrompt = null;
      setInstalling(false);
      setDismissed(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={cn(
        floatingCardClass,
        'bottom-float z-30 flex flex-col gap-3 duration-300 animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none',
      )}
    >
      <div className="flex items-start gap-3">
        {/* A plain img: the icon is a fixed-size static PNG that needs no optimizing. */}
        <img
          src="/icons/icon-192.png"
          alt=""
          width={40}
          height={40}
          className="size-11 rounded-xl shadow-sm"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p id={titleId} className="text-base leading-snug font-medium tracking-tight">
            {copy.title}
          </p>
          <p className="text-sm leading-snug text-muted-foreground">
            {route === 'ios' ? (
              <>
                {copy.iosStepsBefore}{' '}
                <Share className="inline size-4 align-text-bottom" aria-label={copy.shareIcon} />{' '}
                {copy.iosStepsAfter}
              </>
            ) : route === 'menu' ? (
              copy.menuSteps
            ) : (
              copy.description
            )}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {route === 'native' ? (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={notNow}>
              {copy.notNow}
            </Button>
            <Button type="button" size="sm" disabled={installing} onClick={() => void install()}>
              {copy.install}
            </Button>
          </>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={notNow}>
            {copy.gotIt}
          </Button>
        )}
      </div>
    </div>
  );
}
