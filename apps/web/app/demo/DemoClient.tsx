'use client';

import dynamic from 'next/dynamic';

const WebExperience = dynamic(
  () => import('../components/WebExperience').then((module) => module.WebExperience),
  { ssr: false },
);

export default function DemoClient() {
  return <WebExperience />;
}
