import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export const metadata = { title: 'License | Calm in the Rush' };

export default function LicensePage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="page-main">
        <header>
          <div className="eyebrow">License</div>
          <h1>Source-available, noncommercial.</h1>
          <p className="lead">
            Repository-owned software uses PolyForm Noncommercial 1.0.0. Third-party media keeps its
            original license.
          </p>
        </header>
        <article className="markdown">
          <p>Required Notice: Copyright 2026 Litenova Solutions (https://litenova.solutions/)</p>
          <p>
            <a href="https://polyformproject.org/licenses/noncommercial/1.0.0">
              Read the authoritative license text.
            </a>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
