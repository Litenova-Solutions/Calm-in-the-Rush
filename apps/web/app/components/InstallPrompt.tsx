// Client boundary: install support depends on browser events and media queries.
'use client';

import { useEffect, useId, useState } from 'react';
import { Share } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { InstallCopy } from '@/lib/content/strings';
import { promptInstall } from '@/lib/pwa/install';

import { useInstallRoute } from './useInstallRoute';

/** Delay before the prompt appears, so it never interrupts the moment a screen opens. */
const showDelayMs = 1500;

/**
 * Invites a visitor to add the app to the home screen. It appears on the calm
 * logo screen before the final reflection, every time that screen opens, and
 * stays away for the rest of the visit once dismissed.
 */
export function InstallPrompt({
  copy,
  allowed,
  iconSrc,
}: {
  copy: InstallCopy;
  allowed: boolean;
  iconSrc: string;
}) {
  const titleId = useId();
  const route = useInstallRoute();
  const [dismissed, setDismissed] = useState(false);
  const [armed, setArmed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!allowed) {
      setArmed(false);
      setDismissed(false);
      return;
    }
    const timer = window.setTimeout(() => setArmed(true), showDelayMs);
    return () => window.clearTimeout(timer);
  }, [allowed]);

  if (route === 'none' || dismissed || !armed || !allowed) return null;

  const notNow = () => setDismissed(true);

  const install = async () => {
    setInstalling(true);
    try {
      const outcome = await promptInstall();
      if (outcome === 'unavailable') return;
      setDismissed(true);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="absolute inset-x-3 bottom-above-nav z-30 flex flex-col gap-1 rounded-2xl bg-background/95 py-3 pr-2 pl-3 shadow-lg ring-1 ring-foreground/10 backdrop-blur-xl duration-500 animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
    >
      <div className="flex items-start gap-3 pr-1">
        {/* A plain img: the icon is a fixed-size static PNG that needs no optimizing. */}
        <img src={iconSrc} alt="" width={40} height={40} className="size-10 shrink-0" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p id={titleId} className="text-sm leading-snug font-medium">
            {copy.title}
          </p>
          <p className="text-xs leading-snug text-muted-foreground">
            {route === 'ios' ? (
              <>
                {copy.iosStepsBefore}{' '}
                <Share
                  role="img"
                  className="inline size-3.5 align-text-bottom"
                  aria-label={copy.shareIcon}
                />{' '}
                {copy.iosStepsAfter}
              </>
            ) : route === 'in-app' ? (
              copy.inAppSteps
            ) : route === 'menu' ? (
              copy.menuSteps
            ) : (
              copy.description
            )}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-1">
        {route === 'native' ? (
          <>
            <Button type="button" variant="ghost" className="h-10 px-3" onClick={notNow}>
              {copy.notNow}
            </Button>
            <Button
              type="button"
              className="h-10 rounded-full px-5"
              disabled={installing}
              onClick={() => void install()}
            >
              {copy.install}
            </Button>
          </>
        ) : (
          <Button type="button" variant="ghost" className="h-10 px-3" onClick={notNow}>
            {copy.gotIt}
          </Button>
        )}
      </div>
    </div>
  );
}
