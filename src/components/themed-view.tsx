import { forwardRef } from 'react';
import {
  StyleSheet,
  View,
  type ColorValue,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from 'hooks/use-theme-color';

type LayoutValue = ViewStyle['width'];
type SpacingValue = ViewStyle['padding'];

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
} & Partial<{
    flex: number | boolean;
    flexGrow: number | true;
    flexBasis: ViewStyle['flexBasis'];
    row: boolean;
    wrap: boolean;
    rowCenter: boolean;
    contentCenter: boolean;
    alignItems: ViewStyle['alignItems'];
    justifyContent: ViewStyle['justifyContent'];
    alignSelf: ViewStyle['alignSelf'];
    zIndex: number;
    padding: SpacingValue;
    paddingHorizontal: SpacingValue;
    paddingVertical: SpacingValue;
    paddingLeft: SpacingValue;
    paddingTop: SpacingValue;
    paddingRight: SpacingValue;
    paddingBottom: SpacingValue;
    margin: SpacingValue;
    marginHorizontal: SpacingValue;
    marginVertical: SpacingValue;
    marginLeft: SpacingValue;
    marginTop: SpacingValue;
    marginRight: SpacingValue;
    marginBottom: SpacingValue;
    safePaddingTop: boolean;
    safePaddingBottom: boolean;
    safeMarginTop: boolean;
    safeMarginBottom: boolean;
    radius: number;
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    borderBottomRightRadius: number;
    borderBottomLeftRadius: number;
    borderStyle: ViewStyle['borderStyle'];
    borderWidth: number;
    borderLeftWidth: number;
    borderTopWidth: number;
    borderRightWidth: number;
    borderBottomWidth: number;
    borderColor: ColorValue;
    borderLeftColor: ColorValue;
    borderTopColor: ColorValue;
    borderRightColor: ColorValue;
    borderBottomColor: ColorValue;
    position: ViewStyle['position'];
    top: LayoutValue;
    right: LayoutValue;
    bottom: LayoutValue;
    left: LayoutValue;
    absoluteFillObject: boolean;
    gap: ViewStyle['gap'];
    width: LayoutValue;
    height: LayoutValue;
    maxWidth: LayoutValue;
    maxHeight: LayoutValue;
    minWidth: LayoutValue;
    minHeight: LayoutValue;
    round: number;
    square: number;
    backgroundColor: ColorValue;
    opacity: number;
    transform: ViewStyle['transform'];
  }>;

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

const withSafeInset = (inset: number, value?: SpacingValue): SpacingValue =>
  typeof value === 'number' ? inset + value : inset;

export const ThemedView = forwardRef<View, ThemedViewProps>(function ThemedView(
  {
    style,
    lightColor,
    darkColor,
    row,
    flex,
    flexGrow,
    flexBasis,
    wrap,
    rowCenter,
    contentCenter,
    alignItems,
    justifyContent,
    alignSelf,
    zIndex,
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    margin,
    marginHorizontal,
    marginVertical,
    marginLeft,
    marginTop,
    marginRight,
    marginBottom,
    safePaddingTop,
    safePaddingBottom,
    safeMarginTop,
    safeMarginBottom,
    radius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    borderBottomLeftRadius,
    borderStyle,
    borderWidth,
    borderLeftWidth,
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderColor,
    borderLeftColor,
    borderTopColor,
    borderRightColor,
    borderBottomColor,
    position,
    top,
    right,
    bottom,
    left,
    absoluteFillObject,
    gap,
    width,
    height,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    round,
    square,
    backgroundColor,
    opacity,
    transform,
    ...otherProps
  },
  ref
) {
  const safeInsets = useSafeAreaInsets();
  const themedBackgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );

  return (
    <View
      ref={ref}
      style={[
        { backgroundColor: themedBackgroundColor },
        flex !== undefined ? flexStyle(flex) : undefined,
        flexGrow !== undefined ? flexGrowStyle(flexGrow) : undefined,
        flexBasis !== undefined ? { flexBasis } : undefined,
        row ? styles.row : undefined,
        wrap ? styles.wrap : undefined,
        rowCenter ? styles.rowCenter : undefined,
        contentCenter ? styles.contentCenter : undefined,
        absoluteFillObject ? StyleSheet.absoluteFillObject : undefined,
        round !== undefined ? roundStyle(round) : undefined,
        square !== undefined ? squareStyle(square) : undefined,
        alignItems !== undefined ? { alignItems } : undefined,
        justifyContent !== undefined ? { justifyContent } : undefined,
        alignSelf !== undefined ? { alignSelf } : undefined,
        zIndex !== undefined ? { zIndex } : undefined,
        backgroundColor !== undefined ? { backgroundColor } : undefined,
        opacity !== undefined ? { opacity } : undefined,
        transform !== undefined ? { transform } : undefined,
        padding !== undefined ? { padding } : undefined,
        paddingVertical !== undefined ? { paddingVertical } : undefined,
        paddingHorizontal !== undefined ? { paddingHorizontal } : undefined,
        paddingLeft !== undefined ? { paddingLeft } : undefined,
        paddingRight !== undefined ? { paddingRight } : undefined,
        paddingTop !== undefined ? { paddingTop } : undefined,
        paddingBottom !== undefined ? { paddingBottom } : undefined,
        safePaddingTop ? { paddingTop: withSafeInset(safeInsets.top, paddingTop) } : undefined,
        safePaddingBottom
          ? { paddingBottom: withSafeInset(safeInsets.bottom, paddingBottom) }
          : undefined,
        margin !== undefined ? { margin } : undefined,
        marginVertical !== undefined ? { marginVertical } : undefined,
        marginHorizontal !== undefined ? { marginHorizontal } : undefined,
        marginLeft !== undefined ? { marginLeft } : undefined,
        marginRight !== undefined ? { marginRight } : undefined,
        marginTop !== undefined ? { marginTop } : undefined,
        marginBottom !== undefined ? { marginBottom } : undefined,
        safeMarginTop ? { marginTop: withSafeInset(safeInsets.top, marginTop) } : undefined,
        safeMarginBottom ? { marginBottom: withSafeInset(safeInsets.bottom, marginBottom) } : undefined,
        radius !== undefined ? { borderRadius: radius } : undefined,
        borderTopLeftRadius !== undefined ? { borderTopLeftRadius } : undefined,
        borderTopRightRadius !== undefined ? { borderTopRightRadius } : undefined,
        borderBottomLeftRadius !== undefined ? { borderBottomLeftRadius } : undefined,
        borderBottomRightRadius !== undefined ? { borderBottomRightRadius } : undefined,
        borderWidth !== undefined ? { borderWidth } : undefined,
        borderTopWidth !== undefined ? { borderTopWidth } : undefined,
        borderLeftWidth !== undefined ? { borderLeftWidth } : undefined,
        borderRightWidth !== undefined ? { borderRightWidth } : undefined,
        borderBottomWidth !== undefined ? { borderBottomWidth } : undefined,
        borderColor !== undefined ? { borderColor } : undefined,
        borderLeftColor !== undefined ? { borderLeftColor } : undefined,
        borderTopColor !== undefined ? { borderTopColor } : undefined,
        borderRightColor !== undefined ? { borderRightColor } : undefined,
        borderBottomColor !== undefined ? { borderBottomColor } : undefined,
        borderStyle !== undefined ? { borderStyle } : undefined,
        position !== undefined ? { position } : undefined,
        left !== undefined ? { left } : undefined,
        top !== undefined ? { top } : undefined,
        right !== undefined ? { right } : undefined,
        bottom !== undefined ? { bottom } : undefined,
        width !== undefined ? { width } : undefined,
        height !== undefined ? { height } : undefined,
        maxWidth !== undefined ? { maxWidth } : undefined,
        maxHeight !== undefined ? { maxHeight } : undefined,
        minWidth !== undefined ? { minWidth } : undefined,
        minHeight !== undefined ? { minHeight } : undefined,
        gap !== undefined ? { gap } : undefined,
        style,
      ]}
      {...otherProps}
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
