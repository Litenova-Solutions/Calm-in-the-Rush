import type { Metadata, MetadataRoute } from 'next';

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
      name: 'RUST in de Reuring',
      shortName: 'RUST',
      description: 'Een rustige minuut te midden van alles.',
    },
  };

/** Each locale installs with its own brand logo: CALM for English, RUST for Dutch. */
function iconPath(locale: ExperienceLocale, name: string): string {
  return `/icons/${locale === 'nl' ? 'nl-' : ''}${name}.png`;
}

export function appName(locale: ExperienceLocale): string {
  return appNames[locale].name;
}

export function appDescription(locale: ExperienceLocale): string {
  return appNames[locale].description;
}

export function manifestPath(locale: ExperienceLocale): string {
  return locale === 'nl' ? '/nl/manifest.webmanifest' : '/manifest.webmanifest';
}

/** The page metadata that makes a locale's page installable as that locale's app. */
export function appMetadata(locale: ExperienceLocale): Metadata {
  const name = appName(locale);
  return {
    title: name,
    description: appDescription(locale),
    applicationName: name,
    manifest: manifestPath(locale),
    appleWebApp: { capable: true, title: name, statusBarStyle: 'default' },
    // Next emits the standard meta; older iOS versions still read the Apple-prefixed one.
    other: { 'apple-mobile-web-app-capable': 'yes' },
    icons: {
      icon: [{ url: iconPath(locale, 'icon-192'), sizes: '192x192', type: 'image/png' }],
      apple: [{ url: iconPath(locale, 'apple-icon'), sizes: '180x180', type: 'image/png' }],
    },
  };
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
    scope: startUrl,
    display: 'standalone',
    orientation: 'portrait',
    background_color: appThemeColor,
    theme_color: appThemeColor,
    categories: ['health', 'lifestyle'],
    icons: [
      { src: iconPath(locale, 'icon-192'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: iconPath(locale, 'icon-512'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: iconPath(locale, 'icon-maskable-192'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: iconPath(locale, 'icon-maskable-512'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

export function manifestResponse(locale: ExperienceLocale): Response {
  return new Response(JSON.stringify(buildManifest(locale)), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
}
