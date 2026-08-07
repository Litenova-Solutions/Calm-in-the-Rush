export const colors = {
  deepTeal: '#10252B',
  warmCanvas: '#EEF1E8',
  sage: '#B8CBBD',
  ink: '#183036',
  fog: '#DDE5DE',
  paper: '#FAFBF7',
  muted: '#5B706D',
  danger: '#9E3E36',
  dangerContainer: '#F7E4DF',
  dangerText: '#6D2823',
  focus: '#6C9B86',
} as const;

export const overlays = {
  mediaScrim: 'rgba(7, 23, 27, 0.12)',
  dock: 'rgba(16, 37, 43, 0.66)',
  status: 'rgba(16, 37, 43, 0.8)',
  backdrop: 'rgba(16, 37, 43, 0.58)',
  paper: 'rgba(250, 251, 247, 0.75)',
  border: 'rgba(250, 251, 247, 0.22)',
} as const;

export const shadows = {
  frame: '0 12px 24px rgba(0, 0, 0, 0.25)',
  preview: '0 22px 50px rgba(16, 37, 43, 0.2)',
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

export const fontFamily = 'Manrope, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  display: 48,
} as const;
