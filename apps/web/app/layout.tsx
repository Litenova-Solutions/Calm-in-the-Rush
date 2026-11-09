import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { installCaptureScript } from '@/lib/pwa/install';
import { appName, appThemeColor, manifestPath } from '@/lib/pwa/manifest';
import { cn } from '@/lib/utils';

import { ServiceWorkerRegistration } from './components/ServiceWorkerRegistration';
import './globals.css';

const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calmintherush.org'),
  title: appName('en'),
  description: 'A quiet minute in the middle of everything.',
  applicationName: appName('en'),
  manifest: manifestPath('en'),
  appleWebApp: { capable: true, title: appName('en'), statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  openGraph: {
    title: appName('en'),
    description: 'A quiet minute in the middle of everything.',
    type: 'website',
  },
  alternates: {
    languages: { 'nl-NL': '/nl' },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: appThemeColor,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn('antialiased', fontSans.variable, fontMono.variable, 'font-sans')}
    >
      <head>
        {/* Keeps the browser's one-time install event for the install prompt. */}
        <script dangerouslySetInnerHTML={{ __html: installCaptureScript }} />
      </head>
      <body className="min-h-dvh overscroll-none bg-background text-foreground">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
