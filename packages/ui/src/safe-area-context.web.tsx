import type { PropsWithChildren } from 'react';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

export type Edge = 'top' | 'right' | 'bottom' | 'left';

export type EdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Metrics = {
  insets: EdgeInsets;
  frame: Frame;
};

const zeroInsets: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const zeroFrame: Frame = { x: 0, y: 0, width: 0, height: 0 };

export const initialWindowMetrics: Metrics = {
  insets: zeroInsets,
  frame: zeroFrame,
};

export const SafeAreaInsetsContext = React.createContext<EdgeInsets | null>(null);
export const SafeAreaFrameContext = React.createContext<Frame>(zeroFrame);

type SafeAreaProviderProps = PropsWithChildren<
  ViewProps & {
    initialMetrics?: Metrics | null;
  }
>;

export function SafeAreaProvider({
  children,
  initialMetrics,
  ...viewProps
}: SafeAreaProviderProps) {
  const metrics = initialMetrics ?? { insets: zeroInsets, frame: zeroFrame };

  return (
    <SafeAreaInsetsContext.Provider value={metrics.insets}>
      <SafeAreaFrameContext.Provider value={metrics.frame}>
        <View {...viewProps}>{children}</View>
      </SafeAreaFrameContext.Provider>
    </SafeAreaInsetsContext.Provider>
  );
}

export function SafeAreaView({ children, ...viewProps }: PropsWithChildren<ViewProps>) {
  return <View {...viewProps}>{children}</View>;
}

export function useSafeAreaInsets() {
  return React.useContext(SafeAreaInsetsContext) ?? zeroInsets;
}

export function useSafeAreaFrame() {
  return React.useContext(SafeAreaFrameContext);
}
