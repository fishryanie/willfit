// @ts-check
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, type PropsWithChildren } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gradients } from 'constants/theme';
import type { IButton } from './types';

const ButtonComponent = ({
    children,
    isLoading = false,
    onPress,
    width = 200,
    height = 48,
    backgroundColor = '#fff',
    loadingText = 'Loading...',
    loadingTextColor = 'white',
    loadingTextSize = 16,
    borderRadius,
    gradientColors,
    style,
    loadingTextStyle,
    withPressAnimation = true,
    animationDuration = 250,
    disabled = false,
    showLoadingIndicator = false,
    renderLoadingIndicator,
    loadingTextBackgroundColor = '#cacaca',
  }: IButton): React.JSX.Element => {
    const animationProgress = useSharedValue<number>(isLoading ? 1 : 0);
    const scaleValue = useSharedValue<number>(1);

    useEffect(() => {
      animationProgress.value = withTiming<number>(isLoading ? 1 : 0, {
        duration: animationDuration,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, [animationDuration, animationProgress, isLoading]);

    const calculatedBorderRadius = borderRadius ?? height / 2;

    const contentAnimatedStylez = useAnimatedStyle<Pick<ViewStyle, 'transform' | 'opacity'>>(() => {
      const translateY = interpolate(animationProgress.value, [0, 1], [0, -20]);
      const opacity = interpolate(animationProgress.value, [0, 0.5], [1, 0]);

      return {
        transform: [{ translateY }],
        opacity,
      };
    });

    const loadingAnimatedStylez = useAnimatedStyle<Pick<ViewStyle, 'transform' | 'opacity'>>(() => {
      const translateY = interpolate(animationProgress.value, [0, 1], [20, 0]);
      const opacity = interpolate(animationProgress.value, [0.5, 1], [0, 1]);

      return {
        transform: [{ translateY }],
        opacity,
      };
    });

    const pressAnimatedStylez = useAnimatedStyle<Pick<ViewStyle, 'transform' | 'backgroundColor'>>(() => {
      const bgColor = interpolateColor(animationProgress.value, [0, 1], [backgroundColor, loadingTextBackgroundColor!]);
      return {
        transform: [{ scale: scaleValue.value }],
        backgroundColor: bgColor,
      };
    });

    const handlePressIn = () => {
      if (withPressAnimation && !disabled && !isLoading) {
        scaleValue.value = withTiming(0.95, { duration: 100 });
      }
    };

    const handlePressOut = () => {
      if (withPressAnimation && !disabled && !isLoading) {
        scaleValue.value = withTiming(1, { duration: 200 });
      }
    };

    const renderInnerContent = () => (
      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.contentContainer, contentAnimatedStylez]}>{children}</Animated.View>

        <Animated.View style={[styles.loadingContainer, loadingAnimatedStylez]}>
          {showLoadingIndicator &&
            (renderLoadingIndicator ? (
              renderLoadingIndicator()
            ) : (
              <Animated.View style={{ marginRight: loadingText ? 8 : 0 }}>
                <ActivityIndicator color={'#000'} size={'small'} />
              </Animated.View>
            ))}
          <Animated.Text
            style={[
              styles.loadingText,
              {
                color: loadingTextColor,
                fontSize: loadingTextSize,
              },
              loadingTextStyle,
            ]}>
            {loadingText}
          </Animated.Text>
        </Animated.View>
      </View>
    );

    const useBrandOverlay = gradientColors === Gradients.primary;

    const buttonContent = gradientColors ? (
      <Animated.View style={[styles.gradientGlow, pressAnimatedStylez]}>
        <LayeredGradientPill
          baseColors={gradientColors as [string, string, ...string[]]}
          overlayColors={Gradients.primaryOverlay}
          showOverlay={useBrandOverlay}
          radius={calculatedBorderRadius}
          style={[
            styles.button,
            {
              width,
              height,
              borderRadius: calculatedBorderRadius,
            },
            style,
          ]}>
          {renderInnerContent()}
        </LayeredGradientPill>
      </Animated.View>
    ) : (
      <Animated.View
        style={[
          styles.button,
          {
            width,
            height,
            backgroundColor,
            borderRadius: calculatedBorderRadius,
          },
          pressAnimatedStylez,
          style,
        ]}>
        {renderInnerContent()}
      </Animated.View>
    );

    return (
      <Pressable
        onPress={onPress}
        disabled={isLoading || disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [styles.pressable, Platform.OS === 'ios' && pressed && styles.pressed]}
        accessible={true}
        accessibilityRole='button'
        accessibilityState={{ disabled: isLoading || disabled }}>
        {buttonContent}
      </Pressable>
    );
  };

ButtonComponent.displayName = 'Button';

export const Button = memo(ButtonComponent);
Button.displayName = 'Button';

type PrimaryButtonProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

type LayeredGradientPillProps = PropsWithChildren<{
  baseColors?: readonly [string, string, ...string[]];
  overlayColors?: readonly [string, string];
  radius?: number;
  showOverlay?: boolean;
  baseStart?: { x: number; y: number };
  baseEnd?: { x: number; y: number };
  overlayStart?: { x: number; y: number };
  overlayEnd?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function LayeredGradientPill({
  children,
  baseColors = Gradients.primary,
  overlayColors = Gradients.primaryOverlay,
  radius = 999,
  showOverlay = true,
  baseStart = { x: 0, y: 0 },
  baseEnd = { x: 1, y: 0 },
  overlayStart = { x: 0.5, y: 0 },
  overlayEnd = { x: 0.5, y: 1 },
  style,
  contentStyle,
}: LayeredGradientPillProps) {
  return (
    <View style={[styles.layeredPillShell, { borderRadius: radius }, style]}>
      <LinearGradient
        colors={baseColors as [string, string, ...string[]]}
        start={baseStart}
        end={baseEnd}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />
      {showOverlay && (
        <LinearGradient
          colors={overlayColors as [string, string]}
          start={overlayStart}
          end={overlayEnd}
          style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
          pointerEvents='none'
        />
      )}
      <View style={[styles.layeredPillContent, contentStyle]}>{children}</View>
    </View>
  );
}

export function PrimaryButton({ children, style }: PrimaryButtonProps) {
  return <LayeredGradientPill style={[styles.primaryButton, style]}>{children}</LayeredGradientPill>;
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.9,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientGlow: {
    shadowColor: '#1E6BD6',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  contentWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontWeight: '600',
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E6BD6',
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  layeredPillShell: {
    overflow: 'hidden',
  },
  layeredPillContent: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
