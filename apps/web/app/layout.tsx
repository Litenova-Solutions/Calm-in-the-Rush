import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { installCaptureScript } from '@/lib/pwa/install';
import { appDescription, appMetadata, appName, appThemeColor } from '@/lib/pwa/manifest';
import { cn } from '@/lib/utils';

import { ServiceWorkerRegistration } from './components/ServiceWorkerRegistration';
import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';

const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calmintherush.org'),
  ...appMetadata('en'),
  formatDetection: { telephone: false },
  openGraph: {
    title: appName('en'),
    description: appDescription('en'),
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
  // The keyboard shrinks the layout on Android, so the one-liner field and the
  // navigation stay above it instead of behind it.
  interactiveWidget: 'resizes-content',
  themeColor: appThemeColor,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('antialiased', fontSans.variable, fontMono.variable, 'font-sans')}
    >
      <head>
        {/* Keeps the browser's one-time install event for the install prompt. */}
        <script dangerouslySetInnerHTML={{ __html: installCaptureScript }} />
      </head>
      <body className="min-h-dvh overscroll-none bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
