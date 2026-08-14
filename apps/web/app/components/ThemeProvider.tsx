'use client';

import type { ComponentProps } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/** The demo always uses the light token set. */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
