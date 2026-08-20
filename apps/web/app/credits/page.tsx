import { ProseHeading, ProseLink, ProseText } from '../components/Prose';
import { PublicPage } from '../components/PublicPage';

export const metadata = { title: 'Credits | Calm in the Rush' };

export default function CreditsPage() {
  return (
    <PublicPage
      eyebrow="Credits"
      title="Scene provenance"
      lead="The bundled photographs have recorded sources, output hashes, and license basis in the repository."
    >
      <ProseHeading>Bundled photographs</ProseHeading>
      <ProseText>
        The Nature cover and three Nature tiles are stakeholder-supplied Unsplash photographs by T
        Y, Hardial Aujla, Matteo Confetti, and Dominik Mattern. The three Quiet Moments tiles were
        generated with OpenAI image generation from recorded prompts and depict fictional,
        non-identifiable adults.
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
    </PublicPage>
  );
}
