export const colors = {
  background: '#050B18',
  backgroundSecondary: '#07101F',
  surface: '#0B1220',
  surfaceElevated: '#0E1628',
  card: 'rgba(255,255,255,0.05)',
  cardStrong: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.06)',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.72)',
  textMuted: 'rgba(255,255,255,0.42)',

  primary: '#2F80ED',
  primary2: '#56CCF2',
  accent: '#FF3CAC',
  accent2: '#784BA0',

  success: '#27AE60',
  warning: '#F2C94C',
  danger: '#EB5757',

  primaryGlow: 'rgba(47,128,237,0.35)',
  accentGlow: 'rgba(255,60,172,0.30)',
} as const;

export type AppColorName = keyof typeof colors;
