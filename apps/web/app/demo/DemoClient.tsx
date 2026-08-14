'use client';

import dynamic from 'next/dynamic';

const WebExperience = dynamic(
  () => import('../components/WebExperience').then((module) => module.WebExperience),
  { ssr: false },
);

export default function DemoClient() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6">
      <div className="aspect-phone-frame w-demo-phone max-w-phone rounded-phone bg-stage p-2.5 shadow-xl ring-1 ring-border">
        <WebExperience />
      </div>
    </div>
  );
}
