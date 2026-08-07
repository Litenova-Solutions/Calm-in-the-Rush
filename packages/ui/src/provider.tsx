// Client boundary: React Native Paper owns theme context and portal state.
'use client';

import type { PropsWithChildren } from 'react';
import { PaperProvider } from 'react-native-paper';

import { CalmIcon, iconForPaperName } from './icons';
import { calmTheme } from './theme';

export function CalmProvider({ children }: PropsWithChildren) {
  return (
    <PaperProvider
      theme={calmTheme}
      settings={{
        icon: ({ name, color, size, testID }) => (
          <CalmIcon name={iconForPaperName(name)} color={color} size={size} testID={testID} />
        ),
      }}
    >
      {children}
    </PaperProvider>
  );
}
