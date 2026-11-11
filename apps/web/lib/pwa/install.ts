/**
 * Browser-side install support for the web app. The root layout runs
 * `installCaptureScript` before hydration so the one-time `beforeinstallprompt`
 * event is kept even when it fires before React mounts.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __calmInstallPrompt?: BeforeInstallPromptEvent | null;
  }
  interface Navigator {
    /** Safari on iOS sets this to true inside a home screen app. */
    standalone?: boolean;
  }
}

export const installAvailableEvent = 'calm:install-available';

export const installCaptureScript = `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__calmInstallPrompt=e;window.dispatchEvent(new Event('${installAvailableEvent}'));});window.addEventListener('appinstalled',function(){window.__calmInstallPrompt=null;});`;

/**
 * How this browser lets a visitor install the app:
 * - `native`: the browser offered an install prompt we can show on request.
 * - `ios`: Safari and other iOS browsers, through Share and Add to Home Screen.
 * - `menu`: Firefox on Android, through its browser menu.
 * - `none`: already installed, not a phone or tablet, or no known route.
 */
export type InstallRoute = 'native' | 'ios' | 'menu' | 'none';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    navigator.standalone === true
  );
}

export function detectInstallRoute(): InstallRoute {
  if (isStandalone()) return 'none';
  if (!window.matchMedia('(pointer: coarse)').matches) return 'none';
  if (window.__calmInstallPrompt) return 'native';
  const agent = navigator.userAgent;
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(agent) || iPadOs) return 'ios';
  if (/Android/i.test(agent) && /Firefox/i.test(agent)) return 'menu';
  return 'none';
}

const snoozeKey = 'calm:install-prompt-snoozed-until';
const snoozeDays = 14;

export function isInstallPromptSnoozed(): boolean {
  try {
    const until = Number(window.localStorage.getItem(snoozeKey) ?? 0);
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

export function snoozeInstallPrompt(): void {
  try {
    window.localStorage.setItem(snoozeKey, String(Date.now() + snoozeDays * 86_400_000));
  } catch {
    // Storage can be blocked; the prompt then returns on the next visit.
  }
}
