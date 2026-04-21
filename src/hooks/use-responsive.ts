import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Responsive values (rv)
  const rv = (options: { compact?: number; medium?: number; expanded?: number; nano?: number }) => {
    if (width < 340) return options.nano ?? options.compact ?? 0;
    if (width < 380) return options.compact ?? 0;
    if (width < 600) return options.medium ?? options.compact ?? 0;
    return options.expanded ?? options.medium ?? options.compact ?? 0;
  };

  // Responsive font (rf)
  const rf = (size: number) => {
    const scale = width / 375;
    return Math.round(size * scale);
  };

  return { width, height, rf, rv };
}
