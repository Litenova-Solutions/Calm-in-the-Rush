import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

import { CalmMark } from '../components/CalmMark';
import DemoClient from './DemoClient';

export const metadata = {
  title: 'Demo | Calm in the Rush',
  description: 'A quiet minute in the middle of everything.',
};

export default function DemoPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-stage">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-stage-foreground">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <CalmMark />
          <span>Calm in the Rush</span>
        </Link>
        <Link href="/" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
          Leave the demo
        </Link>
      </header>
      <main className="flex flex-1 flex-col">
        <DemoClient />
      </main>
    </div>
  );
}
