import { colors } from './colors';
import { gradients } from './gradients';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  gradients,
  spacing,
  radius,
  typography,
  shadows,
} as const;

export type AppTheme = typeof theme;

export * from './colors';
export * from './gradients';
export * from './radius';
export * from './shadows';
export * from './spacing';
export * from './typography';
