import { MarkdownContent } from '../components/MarkdownContent';
import { ProseLink, ProseText } from '../components/Prose';
import { PublicPage } from '../components/PublicPage';
import { readProductBrief } from '../../lib/requirements';

export const metadata = {
  title: 'Requirements | Calm in the Rush',
  description: 'The product plan and acceptance criteria for Calm in the Rush.',
};

export default async function RequirementsPage() {
  const brief = await readProductBrief();
  return (
    <PublicPage
      eyebrow="The plan"
      title="Requirements and product brief"
      lead="The public page is rendered from the canonical product brief in the repository. Page and use-case statuses stay planned until their linked tests pass."
    >
      <ProseText>
        <ProseLink href="https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/docs/product/brief.md">
          View the source document on GitHub
        </ProseLink>
      </ProseText>
      <MarkdownContent markdown={brief.markdown} />
    </PublicPage>
  );
}
