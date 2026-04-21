import { useThemeMode } from 'store/use-theme-store';

export function useColorScheme() {
  return useThemeMode();
}
