// Client boundary: dynamic loading keeps IndexedDB and device file access outside the server tree.
'use client';

import dynamic from 'next/dynamic';

import type { ExperienceLocale } from '@/lib/content/strings';

const WebExperience = dynamic(
  () => import('../components/WebExperience').then((module) => module.WebExperience),
  { ssr: false },
);

export default function DemoClient({ locale = 'en' }: { locale?: ExperienceLocale }) {
  return (
    <div className="relative h-dvh w-full bg-device-shell shadow-none ring-0 sm:aspect-phone-frame sm:h-auto sm:w-demo-phone sm:max-w-phone sm:rounded-phone sm:p-2.5 sm:shadow-xl sm:ring-1 sm:ring-foreground/20">
      <WebExperience locale={locale} />
    </div>
  );
}
