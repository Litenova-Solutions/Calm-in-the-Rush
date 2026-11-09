import type { Metadata } from 'next';

import { appName, manifestPath } from '@/lib/pwa/manifest';

import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: appName('nl'),
  description: 'Een rustige minuut te midden van alles.',
  manifest: manifestPath('nl'),
  appleWebApp: { capable: true, title: appName('nl'), statusBarStyle: 'default' },
};

export default function DutchPage() {
  return <AppShell locale="nl" />;
}
