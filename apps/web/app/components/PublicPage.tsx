import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';

import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * The public content shell: header, one page header region, one content card,
 * footer. Declared as `public-shell/default` in the UI vocabulary.
 */
export function PublicPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-normal tracking-tight text-balance sm:text-4xl">{title}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{lead}</p>
        </div>
        <Card className="mt-10">
          <CardContent>{children}</CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
