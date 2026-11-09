// Client boundary: dynamic loading keeps IndexedDB and device file access outside the server tree.
'use client';

import dynamic from 'next/dynamic';

import type { ExperienceLocale } from '@/lib/content/strings';

const WebExperience = dynamic(
  () => import('./WebExperience').then((module) => module.WebExperience),
  {
    ssr: false,
  },
);

export function ExperienceClient({ locale = 'en' }: { locale?: ExperienceLocale }) {
  return <WebExperience locale={locale} />;
}
