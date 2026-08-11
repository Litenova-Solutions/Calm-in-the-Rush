import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

import { PhonePreview } from './components/PhonePreview';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Calm, without a checklist.
            </p>
            <h1 className="text-4xl font-normal tracking-tight text-balance sm:text-5xl">
              A quiet minute in the middle of everything.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Open a real place and stay as long as you like. No account. No streak. Nothing to
              finish.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link href="/demo" className={buttonVariants({ size: 'lg' })}>
                Open the demo
              </Link>
              <Link
                href="/requirements"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Read the plan
              </Link>
              <Link href="/admin" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
                Open admin
              </Link>
            </div>
          </div>
          <PhonePreview />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
