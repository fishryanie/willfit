import { ThemeMode, getThemeColors } from 'constants/theme';
import { useThemeMode } from 'store/use-theme-store';

export function useThemeColor(
  props: Partial<Record<ThemeMode, string>>,
  colorName: keyof ThemeColors,
) {
  const theme = useThemeMode();
  const colors = getThemeColors(theme);

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return colors[colorName];
}
