import { seedScenes } from '@calm/content';
import { Box, ButtonLink, Card, CardContent, Image, PaperText, Screen } from '@calm/ui';

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
        <Box className="section">
          <PaperText variant="labelLarge" tone="muted" className="eyebrow">
            A small pause
          </PaperText>
          <PaperText variant="headlineLarge" accessibilityRole="header" accessibilityLevel={2}>
            Make room for one quiet thing.
          </PaperText>
          <PaperText variant="bodyLarge" tone="muted" className="section-lead">
            The experience keeps the choice small. Pick a real place and leave whenever you are
            ready.
          </PaperText>
          <Box className="principles">
            <Card className="principle">
              <CardContent>
                <PaperText variant="titleLarge">Real places</PaperText>
                <PaperText variant="bodyMedium" tone="muted">
                  Footage and ambient audio remain paired so each scene has a sense of place.
                </PaperText>
              </CardContent>
            </Card>
            <Card className="principle">
              <CardContent>
                <PaperText variant="titleLarge">No pressure</PaperText>
                <PaperText variant="bodyMedium" tone="muted">
                  No goals, timers, streaks, notifications, or progress to maintain.
                </PaperText>
              </CardContent>
            </Card>
            <Card className="principle">
              <CardContent>
                <PaperText variant="titleLarge">Private by default</PaperText>
                <PaperText variant="bodyMedium" tone="muted">
                  No accounts, analytics, cookies, or tracking. Local demo edits stay in this
                  browser.
                </PaperText>
              </CardContent>
            </Card>
          </Box>
        </Box>
        <Box className="section">
          <PaperText variant="labelLarge" tone="muted" className="eyebrow">
            The scene shelf
          </PaperText>
          <PaperText variant="headlineLarge" accessibilityRole="header" accessibilityLevel={2}>
            Four places to begin.
          </PaperText>
          <Box className="gallery">
            {seedScenes.map((scene) => (
              <Card className="scene-card" key={scene.id}>
                <Image
                  source={poster(scene.id)}
                  alt={`${scene.title} poster`}
                  className="scene-card-image"
                />
                <CardContent>
                  <PaperText variant="titleMedium">{scene.title}</PaperText>
                  <PaperText variant="bodySmall" tone="muted">
                    {scene.location}
                  </PaperText>
                  <PaperText variant="bodySmall" tone="muted">
                    {scene.attribution.creator}
                  </PaperText>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
        <Box className="source-panel">
          <Box className="source-card">
            <PaperText variant="labelLarge" tone="muted" className="eyebrow">
              Source-available project
            </PaperText>
            <PaperText variant="headlineLarge" accessibilityRole="header" accessibilityLevel={2}>
              Read the plan. See every boundary.
            </PaperText>
            <PaperText variant="bodyLarge">
              The repository includes the web demo, an Expo app, shared experience code, content
              provenance, and the checks that protect the privacy line.
            </PaperText>
            <Box className="actions">
              <ButtonLink href="https://github.com/Litenova-Solutions/Calm-in-the-Rush" external>
                View on GitHub
              </ButtonLink>
              <ButtonLink href="/requirements" tone="secondary">
                Read requirements
              </ButtonLink>
            </Box>
          </Box>
        </Box>
      </Box>
      <SiteFooter />
    </Screen>
  );
}
