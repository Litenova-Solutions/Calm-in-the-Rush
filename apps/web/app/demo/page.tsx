import Link from 'next/link';
import { CalmMark } from '@calm/ui/mark';

import DemoClient from './DemoClient';

export const metadata = {
  title: 'Demo | Calm in the Rush',
  description: 'A quiet minute in the middle of everything.',
};

export default function DemoPage() {
  return (
    <main className="demo-page">
      <div className="demo-header">
        <Link className="brand" href="/" aria-label="Back to Calm in the Rush home">
          <span className="brand-mark" aria-hidden="true">
            <CalmMark color="var(--deep-teal)" size={22} />
          </span>
          <span>Calm in the Rush</span>
        </Link>
        <Link className="demo-exit" href="/">
          Leave the demo
        </Link>
      </div>
      <div className="demo-stage">
        <DemoClient />
      </div>
    </main>
  );
}
