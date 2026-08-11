import { Box, Brand, ButtonLink, Link, PaperText } from '@calm/ui';

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <Box
      className={overlay ? 'site-header site-header-overlay' : 'site-header'}
      accessibilityRole="banner"
    >
      <Brand
        href="/"
        label="Calm in the Rush"
        tone={overlay ? 'onDark' : 'default'}
        className="site-brand"
      />
      <Box className="header-nav" accessibilityRole="navigation" aria-label="Primary navigation">
        <Link
          href="/requirements"
          variant="nav"
          tone={overlay ? 'onDark' : 'default'}
          className="requirements-link"
        >
          Requirements
        </Link>
        <Link
          href="https://github.com/Litenova-Solutions/Calm-in-the-Rush"
          external
          variant="nav"
          tone={overlay ? 'onDark' : 'default'}
          className="github-link"
        >
          GitHub
        </Link>
        <ButtonLink href="/demo" tone="primary" className="header-action">
          Open the demo
        </ButtonLink>
      </Box>
    </Box>
  );
}
