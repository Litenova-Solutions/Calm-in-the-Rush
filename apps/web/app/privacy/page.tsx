import Link from 'next/link';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export const metadata = { title: 'Privacy | Calm in the Rush' };

export default function PrivacyPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="page-main">
        <header>
          <div className="eyebrow">Privacy</div>
          <h1>Private by default</h1>
          <p className="lead">
            The demo does not create accounts or send local admin content to a server.
          </p>
        </header>
        <article className="markdown">
          <h2>Browser data</h2>
          <p>
            Scene edits and uploaded files stay in IndexedDB in the current browser. Private mode,
            storage eviction, and cleared site data can erase them.
          </p>
          <h2>Network boundary</h2>
          <p>
            There is no analytics, advertising, cookie, tracking, location, camera, or microphone
            service.
          </p>
          <p>
            <Link href="/requirements">Read the full product plan.</Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
