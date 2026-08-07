import { Link, PaperText } from '@calm/ui';

import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'License | Calm in the Rush' };

export default function LicensePage() {
  return (
    <PublicPage
      eyebrow="License"
      title="Source-available, noncommercial."
      lead="Repository-owned software uses PolyForm Noncommercial 1.0.0. Third-party media keeps its original license."
    >
      <PaperText variant="bodyLarge">
        Required Notice: Copyright 2026 Litenova Solutions (https://litenova.solutions/)
      </PaperText>
      <Link href="https://polyformproject.org/licenses/noncommercial/1.0.0" external>
        Read the authoritative license text.
      </Link>
    </PublicPage>
  );
}
