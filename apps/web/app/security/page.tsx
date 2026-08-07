import { Link, PaperText } from '@calm/ui';

import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'Security | Calm in the Rush' };

export default function SecurityPage() {
  return (
    <PublicPage
      eyebrow="Security"
      title="Report a concern privately."
      lead="This demo has no server API or remote content write."
    >
      <PaperText variant="bodyLarge">
        Send vulnerability reports to{' '}
        <Link href="mailto:info@litenova.solutions" external>
          info@litenova.solutions
        </Link>{' '}
        with a route, reproduction steps, and evidence. Do not post private data in a public issue.
      </PaperText>
    </PublicPage>
  );
}
