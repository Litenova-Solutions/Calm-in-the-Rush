import { Box, ButtonLink, Image, PaperText, Screen } from '@calm/ui';

import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';

const poster = (id: string) => `/media/scenes/${id}/poster.jpg`;

export default function LandingPage() {
  return (
    <Screen className="site-shell">
      <SiteHeader />
      <Box accessibilityRole="main">
        <Box className="hero">
          <Box className="hero-copy-block">
            <PaperText variant="labelLarge" tone="muted" className="eyebrow">
              Calm, without a checklist.
            </PaperText>
            <PaperText
              variant="displayLarge"
              accessibilityRole="header"
              accessibilityLevel={1}
              className="hero-title"
            >
              A quiet minute in the middle of everything.
            </PaperText>
            <PaperText variant="bodyLarge" tone="muted" className="hero-copy">
              Open a real place and stay as long as you like. No account. No streak. Nothing to
              finish.
            </PaperText>
            <Box className="actions">
              <ButtonLink href="/demo">Open the demo</ButtonLink>
              <ButtonLink href="/requirements" tone="secondary">
                Read the plan
              </ButtonLink>
              <ButtonLink href="/admin" tone="secondary">
                Open admin
              </ButtonLink>
            </Box>
          </Box>
          <Box className="phone-preview">
            <Image
              source={poster('lake')}
              alt="Mist above Lake McDonald"
              className="phone-preview-image"
            />
          </Box>
        </Box>
      </Box>
      <SiteFooter />
    </Screen>
  );
}
