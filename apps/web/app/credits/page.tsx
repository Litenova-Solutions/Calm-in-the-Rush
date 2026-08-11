import { ProseHeading, ProseLink, ProseText } from '../components/Prose';
import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'Credits | Calm in the Rush' };

export default function CreditsPage() {
  return (
    <PublicPage
      eyebrow="Credits"
      title="Scene provenance"
      lead="The landing photograph and the four bundled scenes retain their source licenses and review notes."
    >
      <ProseHeading>Landing photograph</ProseHeading>
      <ProseText>
        The Milky Way over Oeschinensee by{' '}
        <ProseLink href="https://commons.wikimedia.org/wiki/File:036_Milky_Way_during_Perseids_seen_from_Oeschinensee_with_water_reflections_Photo_by_Giles_Laurent.jpg">
          Giles Laurent
        </ProseLink>
        , <ProseLink href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</ProseLink>
        , downscaled from the Wikimedia Commons original and cropped to the phone frame.
      </ProseText>
      <ProseHeading>Scenes</ProseHeading>
      <ProseText>
        Lake: National Park Service and Jacob W. Frank through GlacierNPS, United States government
        public-domain basis.
      </ProseText>
      <ProseText>Forest: Fredrik Johansson and Sounds of Changes, CC BY 3.0.</ProseText>
      <ProseText>
        Wheat field: Coup 53, CC BY 3.0, with a license-review-needed flag on the Commons page.
      </ProseText>
      <ProseText>Brook: Poojilsharma07, CC BY-SA 4.0.</ProseText>
      <ProseText>
        Read{' '}
        <ProseLink href="https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/docs/research/media-provenance.md">
          the full provenance record
        </ProseLink>
        .
      </ProseText>
    </PublicPage>
  );
}
