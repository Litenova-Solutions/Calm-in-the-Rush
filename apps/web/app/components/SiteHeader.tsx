import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

import { CalmMark } from './CalmMark';

const externalRepository = 'https://github.com/Litenova-Solutions/Calm-in-the-Rush';

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <CalmMark />
          <span>Calm in the Rush</span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap items-center justify-end gap-1"
        >
          <Link href="/requirements" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Requirements
          </Link>
          <a
            href={externalRepository}
            rel="noreferrer noopener"
            target="_blank"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            GitHub
          </a>
          <Link href="/demo" className={buttonVariants({ size: 'sm' })}>
            Open the demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
