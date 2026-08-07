import { StyleSheet, View } from 'react-native';

import { colors } from './tokens';

interface CalmMarkProps {
  color?: string;
  size?: number;
}

/** A small breath mark: a quiet point above two receding waves. */
export function CalmMark({ color = colors.paper, size = 24 }: CalmMarkProps) {
  const scale = size / 24;

  return (
    <View accessibilityElementsHidden style={[styles.mark, { width: size, height: size }]}>
      <View
        style={[
          styles.point,
          {
            width: 4 * scale,
            height: 4 * scale,
            borderRadius: 2 * scale,
            backgroundColor: color,
            top: 3 * scale,
            left: 10 * scale,
          },
        ]}
      />
      <View
        style={[
          styles.wave,
          {
            width: 17 * scale,
            height: 8 * scale,
            borderTopWidth: 2 * scale,
            borderColor: color,
            borderRadius: 10 * scale,
            top: 9 * scale,
            left: 3.5 * scale,
          },
        ]}
      />
      <View
        style={[
          styles.wave,
          {
            width: 12 * scale,
            height: 6 * scale,
            borderTopWidth: 1.5 * scale,
            borderColor: color,
            borderRadius: 8 * scale,
            opacity: 0.58,
            top: 14 * scale,
            left: 6 * scale,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { position: 'relative' },
  point: { position: 'absolute' },
  wave: { position: 'absolute' },
});
