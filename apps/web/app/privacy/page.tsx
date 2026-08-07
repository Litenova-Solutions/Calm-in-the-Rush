import { Link, PaperText } from '@calm/ui';

import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'Privacy | Calm in the Rush' };

export default function PrivacyPage() {
  return (
    <PublicPage
      eyebrow="Privacy"
      title="Private by default"
      lead="The demo does not create accounts or send local admin content to a server."
    >
      <PaperText variant="headlineSmall" accessibilityRole="header" accessibilityLevel={2}>
        Browser data
      </PaperText>
      <PaperText variant="bodyLarge">
        Scene edits and uploaded files stay in IndexedDB in the current browser. Private mode,
        storage eviction, and cleared site data can erase them.
      </PaperText>
      <PaperText variant="headlineSmall" accessibilityRole="header" accessibilityLevel={2}>
        Network boundary
      </PaperText>
      <PaperText variant="bodyLarge">
        There is no analytics, advertising, cookie, tracking, location, camera, or microphone
        service.
      </PaperText>
      <Link href="/requirements">Read the full product plan.</Link>
    </PublicPage>
  );
}
