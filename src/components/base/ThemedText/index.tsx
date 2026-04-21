import { forwardRef } from 'react';
import { StyleSheet, Text, type ColorValue, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { useResponsive } from 'hooks/use-responsive';

import { useThemeColor } from 'store/use-theme-store';

type LayoutValue = TextStyle['width'];
type SpacingValue = TextStyle['padding'];

export type ThemedTextType = 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemedTextType;
} & Partial<{
    flex: number | boolean;
    alignSelf: TextStyle['alignSelf'];
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
    position: TextStyle['position'];
    top: LayoutValue;
    right: LayoutValue;
    bottom: LayoutValue;
    left: LayoutValue;
    width: LayoutValue;
    height: LayoutValue;
    maxWidth: LayoutValue;
    maxHeight: LayoutValue;
    minWidth: LayoutValue;
    minHeight: LayoutValue;
    opacity: number;
    transform: TextStyle['transform'];
    color: ColorValue;
    fontFamily: TextStyle['fontFamily'];
    fontSize: number;
    fontStyle: TextStyle['fontStyle'];
    fontWeight: TextStyle['fontWeight'];
    letterSpacing: number;
    lineHeight: number;
    textAlign: TextStyle['textAlign'];
    textTransform: TextStyle['textTransform'];
    textDecorationLine: TextStyle['textDecorationLine'];
    includeFontPadding: TextStyle['includeFontPadding'];
  }>;

const flexStyle = (flex: number | boolean): TextStyle => ({
  flex: typeof flex === 'number' ? flex : flex ? 1 : 0,
});

const RESPONSIVE_TEXT_KEYS = new Set<string>([
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
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'textShadowRadius',
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

const scaleSpacingValue = (value: SpacingValue | undefined, rf: (size: number) => number): SpacingValue | undefined =>
  typeof value === 'number' ? rf(value) : value;

const scaleLayoutValue = (value: LayoutValue | undefined, rf: (size: number) => number): LayoutValue | undefined =>
  typeof value === 'number' ? rf(value) : value;

const scaleTextStyleValue = (key: string, value: unknown, rf: (size: number) => number): unknown => {
  if (typeof value === 'number' && RESPONSIVE_TEXT_KEYS.has(key)) {
    return rf(value);
  }

  return value;
};

const scaleTextStyle = (style: TextStyle, rf: (size: number) => number): TextStyle => {
  const scaledStyle: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(style)) {
    if (value === undefined) continue;
    scaledStyle[key] = scaleTextStyleValue(key, value, rf);
  }

  return scaledStyle as TextStyle;
};

const scaleStyleProp = (style: StyleProp<TextStyle>, rf: (size: number) => number): StyleProp<TextStyle> => {
  if (!style) return style;
  const flattened = StyleSheet.flatten(style);
  if (!flattened) return style;

  return scaleTextStyle(flattened, rf);
};

const textTypeStyle = (type: ThemedTextType, rf: (size: number) => number): TextStyle | undefined => {
  switch (type) {
    case 'default':
      return {
        fontSize: rf(16),
        lineHeight: rf(24),
      };
    case 'defaultSemiBold':
      return {
        fontSize: rf(16),
        lineHeight: rf(24),
        fontWeight: '600',
      };
    case 'title':
      return {
        fontSize: rf(28),
        fontWeight: '700',
        lineHeight: rf(32),
      };
    case 'subtitle':
      return {
        fontSize: rf(18),
        fontWeight: '600',
      };
    case 'link':
      return {
        lineHeight: rf(30),
        fontSize: rf(16),
      };
    default:
      return undefined;
  }
};

export const ThemedText = forwardRef<Text, ThemedTextProps>(function ThemedText(
  {
    style,
    lightColor,
    darkColor,
    type = 'default',
    flex,
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
    position,
    top,
    right,
    bottom,
    left,
    width,
    height,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    opacity,
    transform,
    color,
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    letterSpacing,
    lineHeight,
    textAlign,
    textTransform,
    textDecorationLine,
    includeFontPadding = false,
    ...rest
  },
  ref,
) {
  const screen = useResponsive();
  const themedColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const resolvedTypeStyle = textTypeStyle(type, screen.rf);
  const resolvedStyle = scaleStyleProp(style, screen.rf);

  return (
    <Text
      ref={ref}
      style={[
        { color: color ?? themedColor, includeFontPadding },
        resolvedTypeStyle,
        type === 'link' && color === undefined ? styles.linkColor : undefined,
        flex !== undefined ? flexStyle(flex) : undefined,
        alignSelf !== undefined ? { alignSelf } : undefined,
        zIndex !== undefined ? { zIndex } : undefined,
        opacity !== undefined ? { opacity } : undefined,
        transform !== undefined ? { transform } : undefined,
        fontFamily !== undefined ? { fontFamily } : undefined,
        fontSize !== undefined ? { fontSize: screen.rf(fontSize) } : undefined,
        fontStyle !== undefined ? { fontStyle } : undefined,
        fontWeight !== undefined ? { fontWeight } : undefined,
        letterSpacing !== undefined ? { letterSpacing: screen.rf(letterSpacing) } : undefined,
        lineHeight !== undefined ? { lineHeight: screen.rf(lineHeight) } : undefined,
        textAlign !== undefined ? { textAlign } : undefined,
        textTransform !== undefined ? { textTransform } : undefined,
        textDecorationLine !== undefined ? { textDecorationLine } : undefined,
        padding !== undefined ? { padding: scaleSpacingValue(padding, screen.rf) } : undefined,
        paddingVertical !== undefined ? { paddingVertical: scaleSpacingValue(paddingVertical, screen.rf) } : undefined,
        paddingHorizontal !== undefined ? { paddingHorizontal: scaleSpacingValue(paddingHorizontal, screen.rf) } : undefined,
        paddingLeft !== undefined ? { paddingLeft: scaleSpacingValue(paddingLeft, screen.rf) } : undefined,
        paddingRight !== undefined ? { paddingRight: scaleSpacingValue(paddingRight, screen.rf) } : undefined,
        paddingTop !== undefined ? { paddingTop: scaleSpacingValue(paddingTop, screen.rf) } : undefined,
        paddingBottom !== undefined ? { paddingBottom: scaleSpacingValue(paddingBottom, screen.rf) } : undefined,
        margin !== undefined ? { margin: scaleSpacingValue(margin, screen.rf) } : undefined,
        marginVertical !== undefined ? { marginVertical: scaleSpacingValue(marginVertical, screen.rf) } : undefined,
        marginHorizontal !== undefined ? { marginHorizontal: scaleSpacingValue(marginHorizontal, screen.rf) } : undefined,
        marginLeft !== undefined ? { marginLeft: scaleSpacingValue(marginLeft, screen.rf) } : undefined,
        marginRight !== undefined ? { marginRight: scaleSpacingValue(marginRight, screen.rf) } : undefined,
        marginTop !== undefined ? { marginTop: scaleSpacingValue(marginTop, screen.rf) } : undefined,
        marginBottom !== undefined ? { marginBottom: scaleSpacingValue(marginBottom, screen.rf) } : undefined,
        position !== undefined ? { position } : undefined,
        left !== undefined ? { left: scaleLayoutValue(left, screen.rf) } : undefined,
        top !== undefined ? { top: scaleLayoutValue(top, screen.rf) } : undefined,
        right !== undefined ? { right: scaleLayoutValue(right, screen.rf) } : undefined,
        bottom !== undefined ? { bottom: scaleLayoutValue(bottom, screen.rf) } : undefined,
        width !== undefined ? { width: scaleLayoutValue(width, screen.rf) } : undefined,
        height !== undefined ? { height: scaleLayoutValue(height, screen.rf) } : undefined,
        maxWidth !== undefined ? { maxWidth: scaleLayoutValue(maxWidth, screen.rf) } : undefined,
        maxHeight !== undefined ? { maxHeight: scaleLayoutValue(maxHeight, screen.rf) } : undefined,
        minWidth !== undefined ? { minWidth: scaleLayoutValue(minWidth, screen.rf) } : undefined,
        minHeight !== undefined ? { minHeight: scaleLayoutValue(minHeight, screen.rf) } : undefined,
        resolvedStyle,
      ]}
      {...rest}
    />
  );
});

export const TextTheme = ThemedText;

const styles = StyleSheet.create({
  linkColor: {
    color: '#0a7ea4',
  },
});
