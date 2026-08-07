import type { ReactNode } from 'react';

import { Box, PaperText, Screen, Surface } from '@calm/ui';

import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function PublicPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <Screen className="site-shell">
      <SiteHeader />
      <Box className="page-main" accessibilityRole="main">
        <Box className="page-header">
          <PaperText variant="labelLarge" tone="muted" className="eyebrow">
            {eyebrow}
          </PaperText>
          <PaperText
            variant="displaySmall"
            accessibilityRole="header"
            accessibilityLevel={1}
            className="page-title"
          >
            {title}
          </PaperText>
          <PaperText variant="bodyLarge" tone="muted" className="lead">
            {lead}
          </PaperText>
        </Box>
        <Surface className="markdown-card">
          <Box className="markdown-content">{children}</Box>
        </Surface>
      </Box>
      <SiteFooter />
    </Screen>
  );
}
