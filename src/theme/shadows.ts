import { colors } from './colors';

export const shadows = {
  softShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  mediumShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  glowPrimary: {
    shadowColor: colors.primary,
    shadowOpacity: 0.38,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    elevation: 9,
  },
  glowAccent: {
    shadowColor: colors.accent,
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
