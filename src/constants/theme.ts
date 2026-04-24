import { Platform } from 'react-native';

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

export enum AnimationType {
  Circular = 'circular',
  Wipe = 'wipe',
  CircularInverted = 'circularInverted',
  WipeRight = 'wipeRight',
  WipeDown = 'wipeDown',
  WipeUp = 'wipeUp',
}

export enum EasingType {
  Linear = 'linear',
  Ease = 'ease',
  EaseIn = 'easeIn',
  EaseOut = 'easeOut',
  EaseInOut = 'easeInOut',
}

export const Gradients = {
  // Brand pill: blue -> cyan, matching the original gradient buttons
  primary: ['#1E6BD6', '#18A7C9'],
  primaryOverlay: ['transparent', 'transparent'],
  accent: ['#FF77C8', '#8B2CF5'],
  subtle: ['#F8F2FF', '#FFFFFF'],
} as const;

export const Colors = {
  light: {
    background: '#F5F7FA',
    foreground: '#0F172A',
    card: '#FFFFFF',

    text: '#0F172A',
    textSecondary: '#64748B',

    border: '#E6EAF0',

    // 🎯 Brand primary (blue-cyan)
    primary: '#1E6BD6',
    primaryForeground: '#FFFFFF',

    // 🟣 secondary trung tính hơn
    secondary: '#64748B',
    secondaryForeground: '#FFFFFF',

    // 🎨 accent (magenta từ logo)
    accent: '#E6007A',
    accentForeground: '#FFFFFF',

    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',

    muted: '#EEF2F7',
    mutedForeground: '#64748B',

    success: '#10B981',
    warning: '#F59E0B',

    // dùng lại tone primary cho info cho đồng bộ
    info: '#1E6BD6',

    tint: '#0F172A',
    icon: '#0F172A',

    tabIconDefault: '#94A3B8',
    tabIconSelected: '#1E6BD6',

    error: '#EF4444',
  },

  dark: {
    background: '#0B0F1A',
    foreground: '#F8FAFC',
    card: '#111827',

    text: '#F8FAFC',
    textSecondary: '#94A3B8',

    border: '#1F2937',

    // 🎯 primary sáng hơn cho dark
    primary: '#3B82F6',
    primaryForeground: '#0B0F1A',

    secondary: '#94A3B8',
    secondaryForeground: '#0B0F1A',

    // 🎨 accent vẫn giữ magenta nhưng sáng hơn
    accent: '#FF2D9A',
    accentForeground: '#0B0F1A',

    destructive: '#F87171',
    destructiveForeground: '#0B0F1A',

    muted: '#1F2937',
    mutedForeground: '#94A3B8',

    success: '#34D399',
    warning: '#FBBF24',

    info: '#3B82F6',

    tint: '#FFFFFF',
    icon: '#FFFFFF',

    tabIconDefault: '#6B7280',
    tabIconSelected: '#3B82F6',

    error: '#F87171',
  },
} as const;

export const getThemeColors = (theme: ThemeMode): ThemeColors => Colors[theme];

export const DEFAULT_ANIMATION_DURATION = 600;
export const DEFAULT_ANIMATION_TYPE = AnimationType.Circular;
export const DEFAULT_SWITCH_DELAY = 80;
export const DEFAULT_EASING = EasingType.EaseInOut;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
