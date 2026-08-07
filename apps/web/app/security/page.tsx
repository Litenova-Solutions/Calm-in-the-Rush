import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export const metadata = { title: 'Security | Calm in the Rush' };

export default function SecurityPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="page-main">
        <header>
          <div className="eyebrow">Security</div>
          <h1>Report a concern privately.</h1>
          <p className="lead">This demo has no server API or remote content write.</p>
        </header>
        <article className="markdown">
          <p>
            Send vulnerability reports to{' '}
            <a href="mailto:info@litenova.solutions">info@litenova.solutions</a> with a route,
            reproduction steps, and evidence. Do not post private data in a public issue.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
