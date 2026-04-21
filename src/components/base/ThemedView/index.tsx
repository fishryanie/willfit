import { useThemeColor } from 'store/use-theme-store';
import { forwardRef } from 'react';
import { StyleSheet, View, ViewProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const withSafeInset = (inset: number, value?: any): any => (typeof value === 'number' ? inset + value : inset);

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
  const themedBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

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
        round !== undefined ? roundStyle(round) : undefined,
        square !== undefined ? squareStyle(square) : undefined,
        radius !== undefined ? { borderRadius: radius } : undefined,
        safePaddingTop && {
          paddingTop: withSafeInset(safeInsets.top, typeof safePaddingTop === 'number' ? safePaddingTop : (rest.paddingTop ?? rest.padding)),
        },
        safePaddingBottom && {
          paddingBottom: withSafeInset(safeInsets.bottom, typeof safePaddingBottom === 'number' ? safePaddingBottom : (rest.paddingBottom ?? rest.padding)),
        },
        safeMarginTop && {
          marginTop: withSafeInset(safeInsets.top, typeof safeMarginTop === 'number' ? safeMarginTop : (rest.marginTop ?? rest.margin)),
        },
        safeMarginBottom && {
          marginBottom: withSafeInset(safeInsets.bottom, typeof safeMarginBottom === 'number' ? safeMarginBottom : (rest.marginBottom ?? rest.margin)),
        },
        safeTop && {
          top: withSafeInset(safeInsets.top, typeof safeTop === 'number' ? safeTop : rest.top),
        },
        safeBottom && {
          bottom: withSafeInset(safeInsets.bottom, typeof safeBottom === 'number' ? safeBottom : rest.bottom),
        },
        rest as ViewStyle,
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
