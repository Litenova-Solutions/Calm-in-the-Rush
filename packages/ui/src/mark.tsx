// Client boundary: the Paper icon context is browser and native UI state.
'use client';

import { Icon } from 'react-native-paper';

import { colors } from './tokens';
import { iconSource } from './icons';

interface CalmMarkProps {
  color?: string;
  size?: number;
}

export function CalmMark({ color = colors.paper, size = 24 }: CalmMarkProps) {
  return <Icon source={iconSource('waves')} color={color} size={size} />;
}
