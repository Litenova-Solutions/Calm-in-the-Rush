import { ProseLink, ProseText } from '../components/Prose';
import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'Security | Calm in the Rush' };

export default function SecurityPage() {
  return (
    <PublicPage
      eyebrow="Security"
      title="Report a concern privately."
      lead="This demo has no server API or remote content write."
    >
      <ProseText>
        Send vulnerability reports to{' '}
        <ProseLink href="mailto:info@litenova.solutions">info@litenova.solutions</ProseLink> with a
        route, reproduction steps, and evidence. Do not post private data in a public issue.
      </ProseText>
    </PublicPage>
  );
}
