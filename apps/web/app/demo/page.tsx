import { Brand, Box, Link, Screen } from '@calm/ui';

import DemoClient from './DemoClient';

export const metadata = {
  title: 'Demo | Calm in the Rush',
  description: 'A quiet minute in the middle of everything.',
};

export default function DemoPage() {
  return (
    <Screen tone="deep" className="demo-page">
      <Box className="demo-header" pointerEvents="box-none">
        <Brand href="/" label="Calm in the Rush" tone="onDark" className="demo-brand" />
        <Link href="/" variant="nav" tone="onDark" className="demo-exit">
          Leave the demo
        </Link>
      </Box>
      <Box className="demo-stage">
        <DemoClient />
      </Box>
    </Screen>
  );
}
