import Link from 'next/link';
import { CalmMark } from '@calm/ui/mark';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Calm in the Rush home">
        <span className="brand-mark" aria-hidden="true">
          <CalmMark color="var(--paper)" size={22} />
        </span>
        <span>Calm in the Rush</span>
      </Link>
      <nav className="header-nav" aria-label="Primary navigation">
        <Link className="requirements-link" href="/requirements">
          Requirements
        </Link>
        <a className="github-link" href="https://github.com/Litenova-Solutions/Calm-in-the-Rush">
          GitHub
        </a>
        <Link className="button button-primary" href="/demo">
          Open the demo
        </Link>
      </nav>
    </header>
  );
}
