import { Link, PaperText } from '@calm/ui';

import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'AI policy | Calm in the Rush' };

export default function AiPolicyPage() {
  return (
    <PublicPage
      eyebrow="AI policy"
      title="Assistance needs evidence."
      lead="AI-assisted work follows the same review, license, security, and test requirements as human-written work."
    >
      <PaperText variant="bodyLarge">
        Material AI assistance must be disclosed. Do not submit secrets, private user information,
        or confidential source material to AI services. AI-generated media requires provenance and
        license evidence. Fabricated citations and test results are prohibited.
      </PaperText>
      <Link
        href="https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/AI_POLICY.md"
        external
      >
        Read the full policy.
      </Link>
    </PublicPage>
  );
}
