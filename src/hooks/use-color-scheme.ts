import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { ThemeContext } from 'components/ui/organisms/theme-switch/context';

export function useColorScheme() {
  const themeContext = useContext(ThemeContext);
  const systemColorScheme = useRNColorScheme();

  return themeContext?.theme ?? systemColorScheme;
}
