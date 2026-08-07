import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export const metadata = { title: 'Credits | Calm in the Rush' };

export default function CreditsPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="page-main">
        <header>
          <div className="eyebrow">Credits</div>
          <h1>Scene provenance</h1>
          <p className="lead">
            The four bundled scenes retain their source licenses and review notes.
          </p>
        </header>
        <article className="markdown">
          <p>
            Lake: National Park Service and Jacob W. Frank through GlacierNPS, United States
            government public-domain basis.
          </p>
          <p>Forest: Fredrik Johansson and Sounds of Changes, CC BY 3.0.</p>
          <p>
            Wheat field: Coup 53, CC BY 3.0, with a license-review-needed flag on the Commons page.
          </p>
          <p>Brook: Poojilsharma07, CC BY-SA 4.0.</p>
          <p>
            Read{' '}
            <a href="https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/docs/research/media-provenance.md">
              the full provenance record
            </a>
            .
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
