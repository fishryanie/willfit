import { useEffect, useState } from 'react';

import { ThemeMode } from 'constants/theme';
import { useThemeMode } from 'store/use-theme-store';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const theme = useThemeMode();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (hasHydrated) {
    return theme;
  }

  return ThemeMode.Light;
}
