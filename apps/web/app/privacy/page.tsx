import { ProseHeading, ProseLink, ProseText } from '../components/Prose';
import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'Privacy | Calm in the Rush' };

export default function PrivacyPage() {
  return (
    <PublicPage
      eyebrow="Privacy"
      title="Private by default"
      lead="The demo does not create accounts or send local admin content to a server."
    >
      <ProseHeading>Browser data</ProseHeading>
      <ProseText>
        Scene edits and uploaded files stay in IndexedDB in the current browser. Private mode,
        storage eviction, and cleared site data can erase them.
      </ProseText>
      <ProseHeading>Network boundary</ProseHeading>
      <ProseText>
        There is no analytics, advertising, cookie, tracking, location, camera, or microphone
        service.
      </ProseText>
      <ProseText>
        <ProseLink href="/requirements">Read the full product plan.</ProseLink>
      </ProseText>
    </PublicPage>
  );
}
