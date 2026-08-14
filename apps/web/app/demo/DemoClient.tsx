'use client';

import dynamic from 'next/dynamic';

import { DemoSplash } from '../components/DemoSplash';

const WebExperience = dynamic(
  () => import('../components/WebExperience').then((module) => module.WebExperience),
  { ssr: false },
);

export default function DemoClient() {
  return (
    <div className="relative aspect-phone-frame w-demo-phone max-w-phone rounded-phone bg-device-shell p-2.5 shadow-xl ring-1 ring-foreground/20">
      <WebExperience />
      <DemoSplash />
    </div>
  );
}
