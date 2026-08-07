import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { readProductBrief } from '../../lib/requirements';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

export const metadata = {
  title: 'Requirements | Calm in the Rush',
  description: 'The product plan and acceptance criteria for Calm in the Rush.',
};

export default async function RequirementsPage() {
  const brief = await readProductBrief();
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="page-main">
        <header>
          <div className="eyebrow">The plan</div>
          <h1>Requirements and product brief</h1>
          <p className="lead">
            The public page is rendered from the canonical product brief in the repository. Page and
            use-case statuses stay planned until their linked tests pass.
          </p>
          <p className="lead">
            <Link href="https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/docs/product/brief.md">
              View the source document on GitHub
            </Link>
          </p>
        </header>
        <article className="markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{brief.markdown}</ReactMarkdown>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
