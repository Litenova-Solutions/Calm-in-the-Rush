import type { ExperienceLocale } from '@/lib/content/strings';

import DemoClient from '../demo/DemoClient';

export function DemoStage({ locale = 'en' }: { locale?: ExperienceLocale }) {
  return (
    <div lang={locale} className="relative flex min-h-dvh flex-col bg-demo-canvas sm:p-3">
      <main className="flex min-h-0 flex-1 items-center justify-center">
        <DemoClient locale={locale} />
      </main>
    </div>
  );
}
