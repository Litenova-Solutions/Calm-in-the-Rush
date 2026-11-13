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

export const installRouteEvent = 'calm:install-route';

export const installCaptureScript = `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__calmInstallPrompt=e;window.dispatchEvent(new Event('${installRouteEvent}'));});window.addEventListener('appinstalled',function(){window.__calmInstallPrompt=null;window.dispatchEvent(new Event('${installRouteEvent}'));});`;

/**
 * How this browser lets a visitor install the app:
 * - `native`: the browser offered an install prompt we can show on request.
 * - `ios`: Safari and other iOS browsers, through Share and Add to Home Screen.
 * - `menu`: Android and desktop Chromium without a captured prompt, through the browser menu.
 * - `in-app`: a browser inside another app, which cannot add a home screen icon.
 * - `none`: already installed, or a browser with no install route.
 */
export type InstallRoute = 'native' | 'ios' | 'menu' | 'in-app' | 'none';

/** What the browser reported after the install prompt closed. */
export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

/** Set once this page has installed the app, so a later route check keeps the button hidden. */
let appInstalled = false;

/** Display modes that mean the page already runs as the installed app. */
const installedDisplayModes = [
  '(display-mode: standalone)',
  '(display-mode: fullscreen)',
  '(display-mode: minimal-ui)',
  '(display-mode: window-controls-overlay)',
];

function isStandalone(): boolean {
  return (
    installedDisplayModes.some((mode) => window.matchMedia(mode).matches) ||
    navigator.standalone === true
  );
}

function isIos(): boolean {
  const agent = navigator.userAgent;
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(agent) || iPadOs;
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

/** Chrome, Edge, and other Chromium browsers on a computer install through their menu. */
function isDesktopChromium(): boolean {
  return (
    /Chrome\/|Chromium\/|Edg\//i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent)
  );
}

/** Browsers inside social apps cannot add a page to the home screen. */
function isInAppBrowser(): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|Messenger|TikTok|Snapchat|LinkedInApp|Twitter|Pinterest|Line\/|MicroMessenger|GSA\//i.test(
    navigator.userAgent,
  );
}

export function detectInstallRoute(): InstallRoute {
  if (appInstalled || isStandalone()) return 'none';
  if (isInAppBrowser()) return 'in-app';
  if (window.__calmInstallPrompt) return 'native';
  if (isIos()) return 'ios';
  if (isAndroid() || isDesktopChromium()) return 'menu';
  return 'none';
}

/** Remembers that the app was installed, so route checks stop offering it. */
export function markAppInstalled(): void {
  appInstalled = true;
}

/**
 * Opens the browser's install prompt. The call must start inside a click or key
 * handler, because browsers only allow the prompt while the visitor is active.
 */
export async function promptInstall(): Promise<InstallOutcome> {
  const event = window.__calmInstallPrompt;
  if (!event) return 'unavailable';
  try {
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') appInstalled = true;
    return choice.outcome;
  } catch {
    return 'unavailable';
  } finally {
    // The browser allows one prompt per event; a new event arrives if it offers again.
    window.__calmInstallPrompt = null;
    window.dispatchEvent(new Event(installRouteEvent));
  }
}
