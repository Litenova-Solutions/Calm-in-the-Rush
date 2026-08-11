import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { cn } from '@/lib/utils';

import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';

const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('antialiased', fontSans.variable, fontMono.variable, 'font-sans')}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
