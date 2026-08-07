import type { ReactNode } from 'react';
import {
  Button as TamaguiButton,
  Card as TamaguiCard,
  Input as TamaguiInput,
  Label,
  Text as TamaguiText,
  XStack,
  YStack,
} from 'tamagui';

import { colors, radii, spacing } from './tokens';

export const Stack = YStack;
export const Surface = YStack;
export const Text = TamaguiText;
export const Card = TamaguiCard;
export const Link = TamaguiText;

export function Button(props: React.ComponentProps<typeof TamaguiButton>) {
  return (
    <TamaguiButton
      {...props}
      borderRadius={radii.md}
      minHeight={44}
      paddingHorizontal={spacing[4]}
      backgroundColor={props.backgroundColor ?? colors.deepTeal}
      color={props.color ?? colors.paper}
      pressStyle={{ opacity: 0.82 }}
      hoverStyle={{ opacity: 0.9 }}
    />
  );
}

export function IconButton(props: React.ComponentProps<typeof TamaguiButton>) {
  return (
    <TamaguiButton
      {...props}
      aria-label={props['aria-label'] ?? props.accessibilityLabel}
      width={44}
      height={44}
      minHeight={44}
      padding={0}
      borderRadius={radii.sm}
      backgroundColor={props.backgroundColor ?? 'transparent'}
      color={props.color ?? colors.ink}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <YStack gap={spacing[2]}>
      <Label color={colors.ink} fontWeight="600">
        {label}
      </Label>
      {children}
      {hint ? (
        <TamaguiText color={colors.muted} fontSize={12}>
          {hint}
        </TamaguiText>
      ) : null}
    </YStack>
  );
}

export function Input(props: React.ComponentProps<typeof TamaguiInput>) {
  return (
    <TamaguiInput
      {...props}
      minHeight={44}
      borderWidth={1}
      borderColor={colors.fog}
      borderRadius={radii.sm}
      backgroundColor={colors.paper}
      color={colors.ink}
      paddingHorizontal={spacing[3]}
    />
  );
}

export function Badge({
  children,
  tone = 'quiet',
}: {
  children: ReactNode;
  tone?: 'quiet' | 'selected';
}) {
  return (
    <XStack
      alignItems="center"
      paddingHorizontal={spacing[2]}
      minHeight={28}
      borderRadius={radii.sm}
      backgroundColor={tone === 'selected' ? colors.sage : colors.fog}
    >
      <TamaguiText color={colors.ink} fontSize={12} fontWeight="600">
        {children}
      </TamaguiText>
    </XStack>
  );
}

export const Dialog = YStack;
export const Sheet = YStack;
