import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_ANIMATION_DURATION, DEFAULT_ANIMATION_TYPE, DEFAULT_EASING, ThemeMode, getThemeColors } from 'constants/theme';

type ThemeAnimationRunner = (touchX?: number, touchY?: number) => Promise<void>;

interface ThemeState {
  theme: ThemeMode;
  isSystem: boolean; // Theo dõi xem có đang dùng theme hệ thống không
  animation: ThemeAnimation;
  _animate?: ThemeAnimationRunner;
  setTheme: (theme: ThemeMode) => void;
  updateSystemTheme: (theme: ThemeMode) => void; // Cập nhật khi hệ thống thay đổi
  setAnimation: (animation: Partial<ThemeAnimation>) => void;
  registerAnimation: (fn: ThemeAnimationRunner) => void;
  unregisterAnimation: (fn: ThemeAnimationRunner) => void;
  toggleTheme: (options?: ThemeOptions) => Promise<void>;
}

const getInitialTheme = (): ThemeMode => (Appearance.getColorScheme() === ThemeMode.Dark ? ThemeMode.Dark : ThemeMode.Light);

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
      isSystem: true, // Mặc định lần đầu là theo hệ thống
      animation: { type: DEFAULT_ANIMATION_TYPE, duration: DEFAULT_ANIMATION_DURATION, easing: DEFAULT_EASING },
      
      setTheme: theme => set({ theme, isSystem: false }), // Khi user set thủ công thì không theo hệ thống nữa
      
      updateSystemTheme: theme => {
        if (get().isSystem) {
          set({ theme });
        }
      },

      setAnimation: animation => set(state => ({ animation: { ...state.animation, ...animation } })),
      registerAnimation: fn => set({ _animate: fn }),
      unregisterAnimation: fn => get()._animate === fn && set({ _animate: undefined }),
      
      toggleTheme: async options => {
        const { _animate, animation, setAnimation, theme, setTheme } = get();
        if (options?.animationType || options?.animationDuration || options?.easing) {
          setAnimation({
            type: options.animationType ?? animation.type,
            duration: options.animationDuration ?? animation.duration,
            easing: options.easing ?? animation.easing,
          });
        }
        await new Promise(resolve => setTimeout(resolve, 0));
        if (_animate) return _animate(options?.touchX, options?.touchY);
        setTheme(theme === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark);
      },
    }),
    {
      name: 'willfit:theme-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ 
        theme: state.theme, 
        isSystem: state.isSystem, // Lưu lại trạng thái user đã override chưa
        animation: state.animation 
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
  return {
    theme,
    colors: getThemeColors(theme),
    config: buildThemeConfig(theme, animation),
    setTheme: useThemeStore(state => state.setTheme),
    toggleTheme: useThemeStore(state => state.toggleTheme),
    isDark: theme === ThemeMode.Dark,
    isLight: theme === ThemeMode.Light,
  };
};

export const useThemeColor = (props: Partial<Record<ThemeMode, string>>, colorName: keyof ThemeColors) => {
  const theme = useThemeMode();
  return props[theme] ?? getThemeColors(theme)[colorName];
};
