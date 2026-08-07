import type { ComponentType } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Circle,
  ExternalLink,
  List,
  Pencil,
  Plus,
  RotateCcw,
  Share2,
  Trash2,
  Waves,
  X,
} from 'lucide-react-native';

type IconProps = { size?: number; color?: string; strokeWidth?: number; testID?: string };
type IconComponent = ComponentType<IconProps>;

export const icons = {
  arrowDown: ArrowDown,
  arrowUp: ArrowUp,
  check: Check,
  chevronDown: ChevronDown,
  close: X,
  circle: Circle,
  edit: Pencil,
  externalLink: ExternalLink,
  list: List,
  plus: Plus,
  reset: RotateCcw,
  share: Share2,
  trash: Trash2,
  waves: Waves,
} as const satisfies Record<string, IconComponent>;

export type CalmIconName = keyof typeof icons;

const iconAliases: Record<string, CalmIconName> = {
  'arrow-down': 'arrowDown',
  'arrow-up': 'arrowUp',
  check: 'check',
  'chevron-down': 'chevronDown',
  close: 'close',
  edit: 'edit',
  'external-link': 'externalLink',
  list: 'list',
  plus: 'plus',
  refresh: 'reset',
  reset: 'reset',
  share: 'share',
  'share-2': 'share',
  trash: 'trash',
  waves: 'waves',
};

export function CalmIcon({ name, ...props }: IconProps & { name: CalmIconName }) {
  const Icon = icons[name];
  const { testID, ...iconProps } = props;
  return <Icon {...iconProps} {...(testID ? { 'data-testid': testID } : {})} />;
}

export function iconSource(name: CalmIconName) {
  return ({ size, color, testID }: IconProps) => (
    <CalmIcon name={name} size={size} color={color} testID={testID} strokeWidth={2} />
  );
}

export function iconForPaperName(name: string): CalmIconName {
  return iconAliases[name] ?? 'circle';
}
