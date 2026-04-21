import { useThemeColor } from 'store/use-theme-store';
import { forwardRef } from 'react';
import { StyleSheet, View, ViewProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from 'hooks/use-responsive';

export type ThemedViewProps = ViewProps &
  Omit<ViewStyle, 'flex' | 'flexGrow'> & {
  lightColor?: string;
  darkColor?: string;
  flex?: number | boolean;
  flexGrow?: number | true;
  row?: boolean;
  rowCenter?: boolean;
  contentCenter?: boolean;
  wrap?: boolean;
  radius?: number;
  round?: number;
  square?: number;
  absoluteFillObject?: boolean;
  safePaddingTop?: boolean | number;
  safePaddingBottom?: boolean | number;
  safeMarginTop?: boolean | number;
  safeMarginBottom?: boolean | number;
  safeTop?: boolean | number;
  safeBottom?: boolean | number;
};

const flexStyle = (flex: number | boolean): ViewStyle => ({
  flex: typeof flex === 'number' ? flex : flex ? 1 : 0,
});

const flexGrowStyle = (flexGrow: number | true): ViewStyle => ({
  flexGrow: typeof flexGrow === 'number' ? flexGrow : 1,
});

const roundStyle = (size: number): ViewStyle => ({
  width: size,
  height: size,
  borderRadius: size / 2,
});

const squareStyle = (size: number): ViewStyle => ({
  width: size,
  height: size,
});

const RESPONSIVE_VIEW_KEYS = new Set<string>([
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'maxWidth',
  'maxHeight',
  'minWidth',
  'minHeight',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginHorizontal',
  'marginVertical',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingHorizontal',
  'paddingVertical',
  'gap',
  'columnGap',
  'rowGap',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
]);

const scaleViewStyleValue = (key: string, value: unknown, rf: (size: number) => number): unknown => {
  if (typeof value === 'number' && RESPONSIVE_VIEW_KEYS.has(key)) {
    return rf(value);
  }

  return value;
};

const scaleViewStyle = (style: ViewStyle, rf: (size: number) => number): ViewStyle => {
  const scaledStyle: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(style)) {
    if (value === undefined) continue;
    scaledStyle[key] = scaleViewStyleValue(key, value, rf);
  }

  return scaledStyle as ViewStyle;
};

const scaleNumericValue = (value: unknown, rf: (size: number) => number): number | undefined =>
  typeof value === 'number' ? rf(value) : undefined;

const withSafeInset = (inset: number, value?: number): number => (typeof value === 'number' ? inset + value : inset);

const hasSafeInsetValue = (value: boolean | number | undefined): boolean => value !== undefined && value !== false;

export const ThemedView = forwardRef<View, ThemedViewProps>(function ThemedView(
  {
    style,
    lightColor,
    darkColor,
    row,
    wrap,
    rowCenter,
    contentCenter,
    absoluteFillObject,
    safePaddingTop,
    safePaddingBottom,
    safeMarginTop,
    safeMarginBottom,
    safeTop,
    safeBottom,
    radius,
    round,
    square,
    flex,
    flexGrow,
    ...rest
  },
  ref,
) {
  const safeInsets = useSafeAreaInsets();
  const screen = useResponsive();
  const themedBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const scaledRest = scaleViewStyle(rest as ViewStyle, screen.rf);

  return (
    <View
      ref={ref}
      style={[
        { backgroundColor: themedBackgroundColor },
        flex !== undefined ? flexStyle(flex) : undefined,
        flexGrow !== undefined ? flexGrowStyle(flexGrow) : undefined,
        row && styles.row,
        wrap && styles.wrap,
        rowCenter && styles.rowCenter,
        contentCenter && styles.contentCenter,
        absoluteFillObject && StyleSheet.absoluteFillObject,
        round !== undefined ? roundStyle(screen.rf(round)) : undefined,
        square !== undefined ? squareStyle(screen.rf(square)) : undefined,
        radius !== undefined ? { borderRadius: screen.rf(radius) } : undefined,
        hasSafeInsetValue(safePaddingTop) ? {
          paddingTop: withSafeInset(
            safeInsets.top,
            typeof safePaddingTop === 'number'
              ? screen.rf(safePaddingTop)
              : scaleNumericValue(rest.paddingTop ?? rest.padding, screen.rf),
          ),
        } : undefined,
        hasSafeInsetValue(safePaddingBottom) ? {
          paddingBottom: withSafeInset(
            safeInsets.bottom,
            typeof safePaddingBottom === 'number'
              ? screen.rf(safePaddingBottom)
              : scaleNumericValue(rest.paddingBottom ?? rest.padding, screen.rf),
          ),
        } : undefined,
        hasSafeInsetValue(safeMarginTop) ? {
          marginTop: withSafeInset(
            safeInsets.top,
            typeof safeMarginTop === 'number' ? screen.rf(safeMarginTop) : scaleNumericValue(rest.marginTop ?? rest.margin, screen.rf),
          ),
        } : undefined,
        hasSafeInsetValue(safeMarginBottom) ? {
          marginBottom: withSafeInset(
            safeInsets.bottom,
            typeof safeMarginBottom === 'number'
              ? screen.rf(safeMarginBottom)
              : scaleNumericValue(rest.marginBottom ?? rest.margin, screen.rf),
          ),
        } : undefined,
        hasSafeInsetValue(safeTop) ? {
          top: withSafeInset(
            safeInsets.top,
            typeof safeTop === 'number' ? screen.rf(safeTop) : scaleNumericValue(rest.top, screen.rf),
          ),
        } : undefined,
        hasSafeInsetValue(safeBottom) ? {
          bottom: withSafeInset(
            safeInsets.bottom,
            typeof safeBottom === 'number' ? screen.rf(safeBottom) : scaleNumericValue(rest.bottom, screen.rf),
          ),
        } : undefined,
        scaledRest,
        style,
      ]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    flexWrap: 'wrap',
  },
});
