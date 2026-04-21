import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_ANIMATION_TYPE,
  DEFAULT_EASING,
  ThemeMode,
  getThemeColors,
} from 'constants/theme';

type ThemeAnimationRunner = (touchX?: number, touchY?: number) => Promise<void>;

interface ThemeState {
  theme: ThemeMode;
  animation: ThemeAnimation;
  _animate?: ThemeAnimationRunner;
  setTheme: (theme: ThemeMode) => void;
  setAnimation: (animation: Partial<ThemeAnimation>) => void;
  registerAnimation: (fn: ThemeAnimationRunner) => void;
  unregisterAnimation: (fn: ThemeAnimationRunner) => void;
  toggleTheme: (options?: ThemeOptions) => Promise<void>;
}

const getInitialTheme = (): ThemeMode => (Appearance.getColorScheme() === ThemeMode.Light ? ThemeMode.Light : ThemeMode.Dark);

const buildThemeConfig = (theme: ThemeMode, animation: ThemeAnimation): ThemeConfig => ({
  mode: theme,
  colors: getThemeColors(theme),
  animationType: animation.type,
  animationDuration: animation.duration,
  easing: animation.easing,
});

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      animation: {
        type: DEFAULT_ANIMATION_TYPE,
        duration: DEFAULT_ANIMATION_DURATION,
        easing: DEFAULT_EASING,
      },

      setTheme: theme => set({ theme }),

      setAnimation: animation =>
        set(state => ({
          animation: { ...state.animation, ...animation },
        })),

      registerAnimation: fn => set({ _animate: fn }),

      unregisterAnimation: fn => {
        if (get()._animate === fn) {
          set({ _animate: undefined });
        }
      },

      toggleTheme: async options => {
        const { _animate, animation, setAnimation } = get();

        if (options?.animationType || options?.animationDuration || options?.easing) {
          setAnimation({
            type: options.animationType ?? animation.type,
            duration: options.animationDuration ?? animation.duration,
            easing: options.easing ?? animation.easing,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 0));

        if (_animate) {
          await _animate(options?.touchX, options?.touchY);
          return;
        }

        const { theme, setTheme } = get();
        setTheme(theme === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark);
      },
    }),
    {
      name: 'willfit:theme-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        theme: state.theme,
        animation: state.animation,
      }),
    },
  ),
);

export const useThemeMode = (): ThemeMode => useThemeStore(state => state.theme);

export const useThemeColors = () => {
  const theme = useThemeMode();
  return getThemeColors(theme);
};

export const useThemeConfig = (): ThemeConfig => {
  const theme = useThemeMode();
  const animation = useThemeStore(state => state.animation);

  return buildThemeConfig(theme, animation);
};

export const useTheme = (): ThemeController => {
  const theme = useThemeMode();
  const animation = useThemeStore(state => state.animation);
  const colors = getThemeColors(theme);
  const setTheme = useThemeStore(state => state.setTheme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  return {
    theme,
    colors,
    config: buildThemeConfig(theme, animation),
    setTheme,
    toggleTheme,
    isDark: theme === ThemeMode.Dark,
    isLight: theme === ThemeMode.Light,
  };
};
