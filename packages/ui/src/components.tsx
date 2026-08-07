/// <reference path="./react-native-web.d.ts" />

// Client boundary: Paper menus and browser file selection own local interaction state.
'use client';

import type { ComponentProps, ComponentType, ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement, useState } from 'react';
import { unstable_createElement as createWebElement } from 'react-native-web';
import {
  Image as NativeImage,
  Platform,
  ScrollView as NativeScrollView,
  StyleSheet,
  View as NativeView,
  type ImageSourcePropType,
  type ImageStyle,
  type ScrollViewProps,
  type TextStyle,
  type ViewStyle,
  type ViewProps,
} from 'react-native';
import {
  ActivityIndicator as PaperActivityIndicator,
  Badge as PaperBadge,
  Button as PaperButton,
  Card as PaperCard,
  Checkbox as PaperCheckbox,
  Dialog as PaperDialogComponent,
  Divider as PaperDivider,
  HelperText as PaperHelperText,
  IconButton as PaperIconButton,
  Menu as PaperMenu,
  Modal as PaperModalComponent,
  Portal as PaperPortal,
  Surface as PaperSurface,
  Text as PaperTextComponent,
  TextInput as PaperTextInput,
  TouchableRipple as PaperTouchableRipple,
  type ButtonProps as PaperButtonProps,
  type CardProps as PaperCardProps,
  type IconButtonProps as PaperIconButtonProps,
  type TextInputProps as PaperTextInputProps,
  type TextProps as PaperTextProps,
} from 'react-native-paper';

import { colors, radii, spacing } from './tokens';
import { type CalmIconName, iconSource } from './icons';
import { CalmMark } from './mark';

type ClassNameProps = { className?: string };
type CalmRole =
  | NonNullable<ViewProps['accessibilityRole']>
  | 'main'
  | 'banner'
  | 'contentinfo'
  | 'navigation'
  | 'heading';
type CalmSemanticProps = {
  role?: CalmRole;
  accessibilityRole?: CalmRole;
  accessibilityLevel?: number;
  ariaLevel?: number;
  'aria-label'?: string;
};

const NativeViewWithClassName = NativeView as unknown as ComponentType<
  Omit<ViewProps, 'accessibilityRole' | 'role'> & ClassNameProps & CalmSemanticProps
>;
const NativeScrollViewWithClassName = NativeScrollView as unknown as ComponentType<
  ScrollViewProps & ClassNameProps
>;
const PaperSurfaceWithClassName = PaperSurface as unknown as ComponentType<
  ComponentProps<typeof PaperSurface> & ClassNameProps
>;
const PaperButtonWithClassName = PaperButton as unknown as ComponentType<
  PaperButtonProps & ClassNameProps
>;
const PaperIconButtonWithClassName = PaperIconButton as unknown as ComponentType<
  PaperIconButtonProps & ClassNameProps
>;
const PaperCardWithClassName = PaperCard as unknown as ComponentType<
  PaperCardProps & ClassNameProps
>;
const PaperTextInputWithClassName = PaperTextInput as unknown as ComponentType<
  PaperTextInputProps & ClassNameProps
>;
const NativeImageWithClassName = NativeImage as unknown as ComponentType<
  ComponentProps<typeof NativeImage> & ClassNameProps
>;

export type BoxProps = Omit<ViewProps, 'style' | 'accessibilityRole' | 'role'> &
  ClassNameProps &
  CalmSemanticProps & { viewStyle?: ViewProps['style'] };

export function Box({ className, viewStyle, accessibilityRole, role, ...props }: BoxProps) {
  if (Platform.OS === 'web') {
    return createClassedWebElement(
      'div',
      {
        ...props,
        accessibilityRole,
        role: role ?? normalizeRole(accessibilityRole),
        style: [styles.webBox, viewStyle],
      },
      className,
    );
  }

  return (
    <NativeViewWithClassName
      {...props}
      accessibilityRole={accessibilityRole}
      role={role ?? normalizeRole(accessibilityRole)}
      className={className}
      style={viewStyle}
    />
  );
}

export type ScrollProps = Omit<ScrollViewProps, 'style' | 'contentContainerStyle'> &
  ClassNameProps & { contentStyle?: ViewStyle };

export function Scroll({
  className,
  contentStyle,
  horizontal = false,
  keyboardShouldPersistTaps,
  showsHorizontalScrollIndicator,
  showsVerticalScrollIndicator,
  ...props
}: ScrollProps) {
  if (Platform.OS === 'web') {
    return createClassedWebElement(
      'div',
      {
        ...props,
        style: [
          styles.webBox,
          {
            flexGrow: 1,
            overflowX: horizontal ? 'auto' : 'hidden',
            overflowY: horizontal ? 'hidden' : 'auto',
          },
          contentStyle,
        ],
      },
      className,
    );
  }

  return (
    <NativeScrollViewWithClassName
      {...props}
      horizontal={horizontal}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      className={className}
      contentContainerStyle={contentStyle}
    />
  );
}

export type ScreenProps = BoxProps & { tone?: 'canvas' | 'deep' };

export function Screen({ className, tone = 'canvas', ...props }: ScreenProps) {
  return (
    <Box
      {...props}
      viewStyle={tone === 'deep' ? styles.screenDeep : styles.screenCanvas}
      className={joinClasses('calm-screen', `calm-screen-${tone}`, className)}
    />
  );
}

export type StackProps = BoxProps & {
  space?: keyof typeof spacing;
  direction?: 'column' | 'row';
  align?: 'stretch' | 'center' | 'start' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
};

export function Stack({
  className,
  space = 4,
  direction = 'column',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  ...props
}: StackProps) {
  return (
    <Box
      {...props}
      viewStyle={{
        flexDirection: direction,
        alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
        justifyContent:
          justify === 'start'
            ? 'flex-start'
            : justify === 'end'
              ? 'flex-end'
              : justify === 'between'
                ? 'space-between'
                : justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: spacing[space],
      }}
      className={joinClasses(
        'calm-stack',
        `calm-stack-space-${space}`,
        `calm-stack-${direction}`,
        `calm-stack-align-${align}`,
        `calm-stack-justify-${justify}`,
        wrap ? 'calm-stack-wrap' : undefined,
        className,
      )}
    />
  );
}

export type SurfaceProps = Omit<ComponentProps<typeof PaperSurface>, 'style'> &
  ClassNameProps & { tone?: 'paper' | 'canvas' | 'sage' | 'deep' };

export function Surface({ className, tone = 'paper', ...props }: SurfaceProps) {
  return wrapClassName(
    joinClasses('calm-surface', `calm-surface-${tone}`, className),
    <PaperSurfaceWithClassName {...props} style={styles.surface} />,
  );
}

type PaperTextTone = 'default' | 'muted' | 'onDark' | 'error';

export type CalmTextProps = Omit<PaperTextProps<any>, 'style' | 'accessibilityRole' | 'role'> &
  ClassNameProps &
  CalmSemanticProps & {
    tone?: PaperTextTone;
    textStyle?: TextStyle;
    href?: string;
    hrefAttrs?: { download?: boolean; rel?: string; target?: string };
  };

const PaperTextWithClassName = PaperTextComponent as unknown as ComponentType<
  CalmTextProps & { style?: TextStyle }
>;

export function PaperText({
  className,
  tone = 'default',
  textStyle,
  accessibilityRole,
  role,
  accessibilityLevel,
  ariaLevel,
  ...props
}: CalmTextProps) {
  return wrapClassName(
    joinClasses('calm-text', `calm-text-${tone}`, className),
    <PaperTextWithClassName
      {...props}
      accessibilityRole={accessibilityRole}
      role={role ?? normalizeRole(accessibilityRole)}
      accessibilityLevel={accessibilityLevel}
      ariaLevel={ariaLevel}
      style={textStyle ? { ...textStyles[tone], ...textStyle } : textStyles[tone]}
    />,
  );
}

export type LinkProps = Omit<CalmTextProps, 'accessibilityRole' | 'variant'> & {
  href: string;
  external?: boolean;
  variant?: 'body' | 'nav' | 'button';
};

export function Link({ href, external = false, variant = 'body', className, ...props }: LinkProps) {
  return (
    <PaperText
      {...props}
      href={href}
      hrefAttrs={external ? { rel: 'noreferrer', target: '_blank' } : undefined}
      accessibilityRole="link"
      className={joinClasses(`calm-link-${variant}`, className)}
    />
  );
}

export function Brand({
  href,
  label,
  tone = 'onDark',
  className,
}: {
  href: string;
  label: string;
  tone?: PaperTextTone;
  className?: string;
}) {
  return (
    <PaperText
      href={href}
      hrefAttrs={{ rel: 'home' }}
      accessibilityRole="link"
      className={joinClasses('calm-brand', className)}
      tone={tone}
      variant="titleMedium"
    >
      <Box className="calm-brand-mark" accessibilityElementsHidden>
        <CalmMark color={tone === 'onDark' ? colors.deepTeal : colors.paper} size={22} />
      </Box>
      {label}
    </PaperText>
  );
}

export type ButtonProps = Omit<
  PaperButtonProps,
  'mode' | 'icon' | 'style' | 'buttonColor' | 'textColor'
> &
  ClassNameProps & {
    tone?: 'primary' | 'secondary' | 'quiet' | 'danger';
    icon?: CalmIconName;
  };

export function Button({ tone = 'primary', icon, className, contentStyle, ...props }: ButtonProps) {
  const mode =
    tone === 'primary' || tone === 'danger'
      ? 'contained'
      : tone === 'secondary'
        ? 'outlined'
        : 'text';
  return wrapClassName(
    joinClasses('calm-button', `calm-button-${tone}`, className),
    <PaperButtonWithClassName
      {...props}
      mode={mode}
      icon={icon ? iconSource(icon) : undefined}
      buttonColor={tone === 'danger' ? colors.danger : undefined}
      textColor={tone === 'danger' ? colors.paper : undefined}
      style={styles.button}
      contentStyle={[styles.buttonContent, contentStyle]}
    />,
  );
}

export function ButtonLink({
  tone = 'primary',
  href,
  external,
  children,
  className,
}: {
  tone?: NonNullable<ButtonProps['tone']>;
  href: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      external={external}
      variant="button"
      tone={tone === 'primary' || tone === 'danger' ? 'onDark' : 'default'}
      className={joinClasses(`calm-button-${tone}`, className)}
    >
      {children}
    </Link>
  );
}

export type IconButtonProps = Omit<PaperIconButtonProps, 'icon' | 'style'> &
  ClassNameProps & { icon: CalmIconName };

export function IconButton({ icon, className, ...props }: IconButtonProps) {
  return wrapClassName(
    joinClasses('calm-icon-button', className),
    <PaperIconButtonWithClassName {...props} icon={iconSource(icon)} style={styles.iconButton} />,
  );
}

export type CardProps = Omit<PaperCardProps, 'style'> & ClassNameProps;

export function Card({ className, ...props }: CardProps) {
  return wrapClassName(
    joinClasses('calm-card', className),
    <PaperCardWithClassName {...props} mode="outlined" />,
  );
}

export const CardContent = PaperCard.Content;
export const CardActions = PaperCard.Actions;
export const CardCover = PaperCard.Cover;

export type ImageProps = Omit<ComponentProps<typeof NativeImage>, 'source' | 'style'> &
  ClassNameProps & { source: string | number; alt: string; imageStyle?: ImageStyle };

export function Image({ source, alt, className, imageStyle, ...props }: ImageProps) {
  if (Platform.OS === 'web') {
    return createClassedWebElement(
      'img',
      {
        ...props,
        alt,
        accessibilityLabel: alt || undefined,
        accessibilityRole: alt ? 'image' : 'none',
        src: typeof source === 'string' ? source : undefined,
        style: imageStyle,
      },
      className,
    );
  }

  const imageSource: ImageSourcePropType = typeof source === 'number' ? source : { uri: source };
  return (
    <NativeImageWithClassName
      {...props}
      source={imageSource}
      accessibilityLabel={alt || undefined}
      accessibilityRole={alt ? 'image' : 'none'}
      className={className}
      style={imageStyle}
    />
  );
}

export type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, hint, error, children, className }: FieldProps) {
  return (
    <Box className={joinClasses('calm-field', className)}>
      <PaperText variant="labelLarge">{label}</PaperText>
      {children}
      {error || hint ? (
        <PaperHelperText type={error ? 'error' : 'info'} visible>
          {error ?? hint}
        </PaperHelperText>
      ) : null}
    </Box>
  );
}

export type TextInputProps = Omit<PaperTextInputProps, 'style'> & ClassNameProps;

export function TextInput({ className, ...props }: TextInputProps) {
  return wrapClassName(
    joinClasses('calm-text-input', className),
    <PaperTextInputWithClassName {...props} mode="outlined" style={styles.textInput} />,
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) {
  const CheckboxItemWithClassName = PaperCheckbox.Item as unknown as ComponentType<
    ComponentProps<typeof PaperCheckbox.Item> & ClassNameProps
  >;
  return wrapClassName(
    joinClasses('calm-checkbox-field', className),
    <CheckboxItemWithClassName
      label={label}
      status={checked ? 'checked' : 'unchecked'}
      onPress={() => onChange(!checked)}
      position="leading"
    />,
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((option) => option.value === value)?.label ?? value;
  return (
    <Box className={joinClasses('calm-field', className)}>
      <PaperText variant="labelLarge">{label}</PaperText>
      <PaperMenu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button
            tone="secondary"
            icon="chevronDown"
            onPress={() => setVisible(true)}
            accessibilityLabel={`${label}: ${selected}`}
          >
            {selected}
          </Button>
        }
      >
        {options.map((option) => (
          <PaperMenu.Item
            key={option.value}
            title={option.label}
            onPress={() => {
              setVisible(false);
              onChange(option.value);
            }}
            accessibilityLabel={option.label}
          />
        ))}
      </PaperMenu>
    </Box>
  );
}

export function FileInput({
  label,
  accept,
  onChange,
  hint,
  className,
}: {
  label: string;
  accept: string;
  onChange: (file: File | undefined) => void;
  hint?: string;
  className?: string;
}) {
  const inputId = `calm-file-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <Box className={joinClasses('calm-file-field', className)}>
      <PaperText variant="labelLarge">{label}</PaperText>
      {Platform.OS === 'web' ? (
        <>
          <input
            id={inputId}
            className="calm-file-input"
            type="file"
            accept={accept}
            onChange={(event) => onChange(event.currentTarget.files?.[0])}
          />
          <PaperButton
            mode="outlined"
            icon={iconSource('externalLink')}
            onPress={() => document.getElementById(inputId)?.click()}
            accessibilityLabel={`Choose ${label.toLowerCase()}`}
            style={styles.fileButton}
          >
            Choose file
          </PaperButton>
        </>
      ) : (
        <PaperText tone="muted">File selection is available in the browser admin.</PaperText>
      )}
      {hint ? <PaperHelperText type="info">{hint}</PaperHelperText> : null}
    </Box>
  );
}

export function StatusMessage({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <PaperText
      accessibilityRole={error ? 'alert' : undefined}
      tone={error ? 'error' : 'default'}
      className={joinClasses('calm-status-message', error ? 'calm-status-error' : undefined)}
    >
      {children}
    </PaperText>
  );
}

export function ActivityIndicator() {
  return <PaperActivityIndicator color={colors.sage} />;
}

export const Divider = PaperDivider;
export const Portal = PaperPortal;
export const PaperDialog = PaperDialogComponent;
export const Touchable = PaperTouchableRipple;

export function Sheet({
  visible,
  onDismiss,
  children,
}: {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
}) {
  return (
    <PaperPortal>
      <PaperModalComponent
        visible={visible}
        onDismiss={onDismiss}
        dismissable
        overlayAccessibilityLabel="Close scene picker"
        style={styles.sheetWrapper}
        contentContainerStyle={styles.sheet}
      >
        <Box accessibilityViewIsModal>{children}</Box>
      </PaperModalComponent>
    </PaperPortal>
  );
}

export function Badge({
  children,
  tone = 'quiet',
}: {
  children: string | number;
  tone?: 'quiet' | 'selected';
}) {
  const BadgeWithClassName = PaperBadge as unknown as ComponentType<
    ComponentProps<typeof PaperBadge> & ClassNameProps
  >;
  return wrapClassName(
    `calm-badge-${tone}`,
    <BadgeWithClassName size={28}>{children}</BadgeWithClassName>,
  );
}

function wrapClassName(className: string | undefined, child: ReactElement) {
  if (Platform.OS !== 'web' || !className) return child;
  return <Box className={className}>{child}</Box>;
}

function createClassedWebElement(
  component: string,
  props: Record<string, unknown>,
  className?: string,
) {
  const element = createWebElement(component, { ...props, className });
  if (!className || !isValidElement(element)) return element;

  const generatedClassName =
    typeof element.props === 'object' && element.props !== null && 'className' in element.props
      ? (element.props as { className?: string }).className
      : undefined;

  return cloneElement(element as ReactElement<{ className?: string }>, {
    className: joinClasses(className, generatedClassName),
  });
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function normalizeRole(role: CalmRole | undefined) {
  if (role === 'header') return 'heading';
  return role;
}

const styles = StyleSheet.create({
  webBox: {
    alignContent: 'flex-start',
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
  },
  screenCanvas: { flex: 1, minHeight: '100%', backgroundColor: colors.warmCanvas },
  screenDeep: { flex: 1, minHeight: '100%', backgroundColor: colors.deepTeal },
  button: { minHeight: 44 },
  buttonContent: { minHeight: 44 },
  iconButton: { minWidth: 44, minHeight: 44 },
  surface: { overflow: 'hidden' },
  textInput: { minHeight: 56 },
  fileButton: { minHeight: 44 },
  sheetWrapper: { justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: colors.warmCanvas,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing[5],
  },
});

const textStyles: Record<PaperTextTone, TextStyle> = {
  default: { color: colors.ink },
  muted: { color: colors.muted },
  onDark: { color: colors.paper },
  error: { color: colors.dangerText },
};
