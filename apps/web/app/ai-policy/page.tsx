import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';

export const metadata = { title: 'AI policy | Calm in the Rush' };

export default function AiPolicyPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="page-main">
        <header>
          <div className="eyebrow">AI policy</div>
          <h1>Assistance needs evidence.</h1>
          <p className="lead">
            AI-assisted work follows the same review, license, security, and test requirements as
            human-written work.
          </p>
        </header>
        <article className="markdown">
          <p>
            Material AI assistance must be disclosed. Do not submit secrets, private user
            information, or confidential source material to AI services. AI-generated media requires
            provenance and license evidence. Fabricated citations and test results are prohibited.
          </p>
          <p>
            <a href="https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/AI_POLICY.md">
              Read the full policy.
            </a>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
