import { Link, PaperText } from '@calm/ui';

import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'Credits | Calm in the Rush' };

export default function CreditsPage() {
  return (
    <PublicPage
      eyebrow="Credits"
      title="Scene provenance"
      lead="The four bundled scenes retain their source licenses and review notes."
    >
      <PaperText variant="bodyLarge">
        Lake: National Park Service and Jacob W. Frank through GlacierNPS, United States government
        public-domain basis.
      </PaperText>
      <PaperText variant="bodyLarge">
        Forest: Fredrik Johansson and Sounds of Changes, CC BY 3.0.
      </PaperText>
      <PaperText variant="bodyLarge">
        Wheat field: Coup 53, CC BY 3.0, with a license-review-needed flag on the Commons page.
      </PaperText>
      <PaperText variant="bodyLarge">Brook: Poojilsharma07, CC BY-SA 4.0.</PaperText>
      <PaperText variant="bodyLarge">
        Read{' '}
        <Link
          href="https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/docs/research/media-provenance.md"
          external
        >
          the full provenance record
        </Link>
        .
      </PaperText>
    </PublicPage>
  );
}
