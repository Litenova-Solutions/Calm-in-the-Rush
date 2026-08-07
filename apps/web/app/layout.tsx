import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calmintherush.org'),
  title: 'Calm in the Rush',
  description: 'A quiet minute in the middle of everything.',
  applicationName: 'Calm in the Rush',
  openGraph: {
    title: 'Calm in the Rush',
    description: 'A quiet minute in the middle of everything.',
    type: 'website',
  },
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
