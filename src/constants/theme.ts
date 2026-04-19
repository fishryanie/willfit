/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#222';
const tintColorDark = '#FF8A00';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    card: '#F5F5F7',
    tint: '#000000',
    icon: '#000000',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#000000',
    accent: '#000000',
    secondary: '#8E8E93',
    success: '#000000',
    warning: '#FACC15',
    error: '#F87171',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1d1e24',
    card: '#262730',
    tint: '#FFFFFF',
    icon: '#FFFFFF',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#FFFFFF',
    accent: '#FF8A00',
    secondary: '#8E8E93',
    success: '#FFFFFF',
    warning: '#FACC15',
    error: '#F87171',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
