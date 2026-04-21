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

export const Colors = {
  light: {
    background: '#FFFFFF',
    foreground: '#000000',
    card: '#F5F5F5',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#3B82F6',
    primaryForeground: '#FFFFFF',
    secondary: '#6B7280',
    secondaryForeground: '#FFFFFF',
    accent: '#8B5CF6',
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    muted: '#F3F4F6',
    mutedForeground: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    tint: '#000000',
    icon: '#000000',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#000000',
    error: '#EF4444',
  },
  dark: {
    background: '#0A0A0A',
    foreground: '#FAFAFA',
    card: '#1A1A1A',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    border: '#27272A',
    primary: '#60A5FA',
    primaryForeground: '#0A0A0A',
    secondary: '#A1A1AA',
    secondaryForeground: '#0A0A0A',
    accent: '#A78BFA',
    accentForeground: '#0A0A0A',
    destructive: '#F87171',
    destructiveForeground: '#0A0A0A',
    muted: '#1F1F23',
    mutedForeground: '#A1A1AA',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    tint: '#FFFFFF',
    icon: '#FFFFFF',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#FFFFFF',
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
