import type { Metadata } from 'next';

import { appMetadata } from '@/lib/pwa/manifest';

import { DemoStage } from '../components/DemoStage';

export const metadata: Metadata = appMetadata('nl');

export default function DutchPage() {
  return <DemoStage locale="nl" />;
}
