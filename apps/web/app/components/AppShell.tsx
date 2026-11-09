import type { ExperienceLocale } from '@/lib/content/strings';

import { ExperienceClient } from './ExperienceClient';

/**
 * The page around the visitor flow. On a phone the flow fills the screen; on a
 * wider screen it keeps phone width in a centered, full-height column.
 */
export function AppShell({ locale = 'en' }: { locale?: ExperienceLocale }) {
  return (
    <main lang={locale} className="flex h-dvh justify-center bg-app-canvas">
      <div className="relative h-full w-full max-w-app bg-background pt-safe">
        <ExperienceClient locale={locale} />
      </div>
    </main>
  );
}
