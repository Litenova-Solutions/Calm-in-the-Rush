import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import DemoClient from '../demo/DemoClient';

export function DemoStage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-demo-canvas p-3">
      <Link
        href="/admin"
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'absolute top-3 right-3 z-10 border-foreground/20 bg-background/80 shadow-sm backdrop-blur-md hover:bg-background',
        )}
        aria-label="Open local administration"
      >
        Admin
      </Link>
      <main className="flex min-h-0 flex-1 items-center justify-center">
        <DemoClient />
      </main>
    </div>
  );
}
