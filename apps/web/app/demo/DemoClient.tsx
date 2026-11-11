// Client boundary: dynamic loading keeps IndexedDB and device file access outside the server tree.
'use client';

import dynamic from 'next/dynamic';

import type { ExperienceLocale } from '@/lib/content/strings';

const WebExperience = dynamic(
  () => import('../components/WebExperience').then((module) => module.WebExperience),
  { ssr: false },
);

/**
 * On a phone the flow fills the screen. Where there is room, it sits in a phone
 * frame so a desktop visitor sees it at phone size.
 */
export default function DemoClient({ locale = 'en' }: { locale?: ExperienceLocale }) {
  return (
    <div className="relative h-dvh w-full bg-device-shell shadow-none ring-0 framed:aspect-phone-frame framed:h-auto framed:w-demo-phone framed:max-w-phone framed:rounded-phone framed:p-2.5 framed:shadow-xl framed:ring-1 framed:ring-foreground/20">
      <WebExperience locale={locale} />
    </div>
  );
}
