import { forwardRef } from 'react';
import { StyleSheet, Text, type ColorValue, type TextProps, type TextStyle } from 'react-native';

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
  const themedColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      ref={ref}
      style={[
        { color: color ?? themedColor, includeFontPadding },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'link' && color === undefined ? styles.linkColor : undefined,
        flex !== undefined ? flexStyle(flex) : undefined,
        alignSelf !== undefined ? { alignSelf } : undefined,
        zIndex !== undefined ? { zIndex } : undefined,
        opacity !== undefined ? { opacity } : undefined,
        transform !== undefined ? { transform } : undefined,
        fontFamily !== undefined ? { fontFamily } : undefined,
        fontSize !== undefined ? { fontSize } : undefined,
        fontStyle !== undefined ? { fontStyle } : undefined,
        fontWeight !== undefined ? { fontWeight } : undefined,
        letterSpacing !== undefined ? { letterSpacing } : undefined,
        lineHeight !== undefined ? { lineHeight } : undefined,
        textAlign !== undefined ? { textAlign } : undefined,
        textTransform !== undefined ? { textTransform } : undefined,
        textDecorationLine !== undefined ? { textDecorationLine } : undefined,
        padding !== undefined ? { padding } : undefined,
        paddingVertical !== undefined ? { paddingVertical } : undefined,
        paddingHorizontal !== undefined ? { paddingHorizontal } : undefined,
        paddingLeft !== undefined ? { paddingLeft } : undefined,
        paddingRight !== undefined ? { paddingRight } : undefined,
        paddingTop !== undefined ? { paddingTop } : undefined,
        paddingBottom !== undefined ? { paddingBottom } : undefined,
        margin !== undefined ? { margin } : undefined,
        marginVertical !== undefined ? { marginVertical } : undefined,
        marginHorizontal !== undefined ? { marginHorizontal } : undefined,
        marginLeft !== undefined ? { marginLeft } : undefined,
        marginRight !== undefined ? { marginRight } : undefined,
        marginTop !== undefined ? { marginTop } : undefined,
        marginBottom !== undefined ? { marginBottom } : undefined,
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
        style,
      ]}
      {...rest}
    />
  );
});

export const TextTheme = ThemedText;

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
  },
  linkColor: {
    color: '#0a7ea4',
  },
});
