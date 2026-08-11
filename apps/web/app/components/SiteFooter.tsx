import { Box, Link, PaperText } from '@calm/ui';

export function SiteFooter() {
  return (
    <Box className="site-footer" accessibilityRole="contentinfo">
      <PaperText tone="muted" variant="bodySmall">
        Calm in the Rush
      </PaperText>
      <Box className="footer-links" accessibilityRole="navigation" aria-label="Footer navigation">
        <Link href="/requirements" variant="nav" tone="muted">
          Requirements
        </Link>
        <Link href="/privacy" variant="nav" tone="muted">
          Privacy
        </Link>
        <Link
          href="https://github.com/Litenova-Solutions/Calm-in-the-Rush"
          external
          variant="nav"
          tone="muted"
        >
          GitHub
        </Link>
        <Link href="/license" variant="nav" tone="muted">
          License
        </Link>
      </Box>
    </Box>
  );
}
