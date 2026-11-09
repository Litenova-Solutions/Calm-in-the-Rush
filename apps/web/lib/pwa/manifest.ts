import type { MetadataRoute } from 'next';

import type { ExperienceLocale } from '@/lib/content/strings';

/** The app background, as hex for the manifest and the browser chrome. Matches `--background`. */
export const appThemeColor = '#f9f4df';

const appNames: Record<ExperienceLocale, { name: string; shortName: string; description: string }> =
  {
    en: {
      name: 'Calm in the Rush',
      shortName: 'Calm',
      description: 'A quiet minute in the middle of everything.',
    },
    nl: {
      name: 'Rust in de Drukte',
      shortName: 'Rust',
      description: 'Een rustige minuut te midden van alles.',
    },
  };

export function appName(locale: ExperienceLocale): string {
  return appNames[locale].name;
}

export function manifestPath(locale: ExperienceLocale): string {
  return locale === 'nl' ? '/nl/manifest.webmanifest' : '/manifest.webmanifest';
}

/**
 * The installable web app manifest. Each locale installs as its own app, so a
 * visitor who adds the Dutch page to the home screen opens the Dutch page.
 */
function buildManifest(locale: ExperienceLocale): MetadataRoute.Manifest {
  const names = appNames[locale];
  const startUrl = locale === 'nl' ? '/nl' : '/';
  return {
    id: startUrl,
    name: names.name,
    short_name: names.shortName,
    description: names.description,
    lang: locale === 'nl' ? 'nl-NL' : 'en',
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: appThemeColor,
    theme_color: appThemeColor,
    categories: ['health', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}

export function manifestResponse(locale: ExperienceLocale): Response {
  return new Response(JSON.stringify(buildManifest(locale)), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
}
