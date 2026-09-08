import { isGalleryScreen, seedExperience } from '@/lib/content/experience';

import { ProseHeading, ProseLink, ProseList, ProseListItem, ProseText } from '../components/Prose';
import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'Credits | Calm in the Rush' };

const videoCredits = seedExperience.screens.flatMap((screen) =>
  isGalleryScreen(screen)
    ? screen.tiles.flatMap((tile) =>
        tile.type === 'prefilled' && tile.attribution
          ? [{ title: tile.title, ...tile.attribution }]
          : [],
      )
    : [],
);

export default function CreditsPage() {
  return (
    <PublicPage
      eyebrow="Credits"
      title="Scene provenance"
      lead="The bundled media have recorded sources, output hashes, and license basis in the repository."
    >
      <ProseHeading>Bundled photographs</ProseHeading>
      <ProseText>
        The three Quiet Moments tiles were generated with OpenAI image generation from recorded
        prompts and depict fictional, non-identifiable adults. Four stakeholder-supplied Unsplash
        photographs by T Y, Hardial Aujla, Matteo Confetti, and Dominik Mattern remain in the media
        folder for existing browser-local configurations. They are no longer part of the default
        experience.
      </ProseText>
      <ProseHeading>License basis</ProseHeading>
      <ProseText>
        The Nature photographs are used under the Unsplash License. OpenAI&apos;s Terms of Use
        assign its rights in generated output to the user, subject to applicable law. Read{' '}
        <ProseLink href="https://github.com/Litenova-Solutions/Calm-in-the-Rush/blob/main/docs/research/media-provenance.md">
          the full provenance record
        </ProseLink>
        .
      </ProseText>
      <ProseHeading>Bundled videos</ProseHeading>
      <ProseText>
        The Nature cover and three Nature tiles are looping video excerpts from Pexels. The full
        record names every source and change.
      </ProseText>
      <ProseList>
        {videoCredits.map((credit) => (
          <ProseListItem key={credit.title}>
            {credit.title} by {credit.author} is used under{' '}
            {credit.licenseUrl ? (
              <ProseLink href={credit.licenseUrl}>{credit.licenseName}</ProseLink>
            ) : (
              credit.licenseName
            )}
            . Changes: {credit.changes} Source:{' '}
            <ProseLink href={credit.sourceUrl}>Pexels page</ProseLink>.
          </ProseListItem>
        ))}
      </ProseList>
      <ProseHeading>Ambient sound</ProseHeading>
      <ProseText>
        Each video carries its own matching ambient bed, all released as CC0 public domain: Forest
        and Stream #1 by Pierre SIBANARCO for the brook, Small waves and beach #1 by Joseph SARDIN
        for the lake, Forest #4 by Joseph SARDIN for the forest, and Wind in Tall Grass by Joseph
        SARDIN for the wheat field. Sound is on by default and follows the active view.
      </ProseText>
    </PublicPage>
  );
}
