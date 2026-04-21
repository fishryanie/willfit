import React, { memo, useCallback, useEffect, useRef } from 'react';

import { useThemeStore } from 'store/use-theme-store';

import { ThemeSwitcher } from './theme';

export const ThemeProvider = memo(function ThemeProvider({
  children,
  onThemeChange,
  onAnimationStart,
  onAnimationComplete,
}: ThemeProviderProps): React.ReactElement {
  const theme = useThemeStore(state => state.theme);
  const animation = useThemeStore(state => state.animation);
  const setTheme = useThemeStore(state => state.setTheme);
  const registerAnimation = useThemeStore(state => state.registerAnimation);
  const unregisterAnimation = useThemeStore(state => state.unregisterAnimation);
  const switcherRef = useRef<ThemeSwitcherRef>(null);

  useEffect(() => {
    const animate: ThemeSwitcherRef['animate'] = (touchX, touchY) =>
      switcherRef.current?.animate(touchX, touchY) ?? Promise.resolve();

    registerAnimation(animate);

    return () => {
      unregisterAnimation(animate);
    };
  }, [registerAnimation, unregisterAnimation]);

  const handleThemeChange = useCallback(
    (newTheme: ThemeMode) => {
      setTheme(newTheme);
      onThemeChange?.(newTheme);
    },
    [setTheme, onThemeChange],
  );

  return (
    <ThemeSwitcher
      ref={switcherRef}
      theme={theme}
      onThemeChange={handleThemeChange}
      animationType={animation.type}
      animationDuration={animation.duration}
      easing={animation.easing}
      onAnimationStart={onAnimationStart}
      onAnimationComplete={onAnimationComplete}>
      {children}
    </ThemeSwitcher>
  );
});

export { ThemeSwitcher } from './theme';
