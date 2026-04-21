import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas, Circle, Group, Image, Mask, Rect, SkImage, makeImageFromView } from '@shopify/react-native-skia';
import { PixelRatio, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import {
  AnimationType,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_ANIMATION_TYPE,
  DEFAULT_EASING,
  DEFAULT_SWITCH_DELAY,
  ThemeMode,
} from 'constants/theme';

import { wait, getEasingFunction, getMaxRadius } from './helpers';

type ThemeSwitchAnimationOptions = {
  type: AnimationType;
  centerX: number;
  centerY: number;
  screenWidth: number;
  screenHeight: number;
  duration: number;
  easing: (value: number) => number;
};

const setSharedValue = (sharedValue: SharedValue<number>, value: number) => {
  sharedValue.value = value;
};

const animateSharedValue = (sharedValue: SharedValue<number>, value: number, duration: number, easing: (value: number) => number) => {
  sharedValue.value = withTiming(value, {
    duration,
    easing,
  });
};

function useThemeSwitchAnimationValues(screenWidth: number, screenHeight: number) {
  const circleRadius = useSharedValue(0);
  const circleCenterX = useSharedValue(screenWidth / 2);
  const circleCenterY = useSharedValue(screenHeight / 2);
  const wipePosition = useSharedValue(0);

  const setCenter = (x: number, y: number) => {
    setSharedValue(circleCenterX, x);
    setSharedValue(circleCenterY, y);
  };

  const run = ({ type, centerX, centerY, screenWidth, screenHeight, duration, easing }: ThemeSwitchAnimationOptions) => {
    switch (type) {
      case AnimationType.Circular: {
        const maxRadius = getMaxRadius(centerX, centerY, screenWidth, screenHeight);
        animateSharedValue(circleRadius, maxRadius, duration, easing);
        break;
      }

      case AnimationType.CircularInverted: {
        const maxRadiusInverted = getMaxRadius(centerX, centerY, screenWidth, screenHeight);
        setSharedValue(circleRadius, maxRadiusInverted);
        animateSharedValue(circleRadius, 0, duration, easing);
        break;
      }

      case AnimationType.Wipe:
        animateSharedValue(wipePosition, screenWidth, duration, easing);
        break;

      case AnimationType.WipeRight:
        setSharedValue(wipePosition, screenWidth);
        animateSharedValue(wipePosition, 0, duration, easing);
        break;

      case AnimationType.WipeDown:
        animateSharedValue(wipePosition, screenHeight, duration, easing);
        break;

      case AnimationType.WipeUp:
        setSharedValue(wipePosition, screenHeight);
        animateSharedValue(wipePosition, 0, duration, easing);
        break;

      default:
        animateSharedValue(wipePosition, screenWidth, duration, easing);
    }
  };

  const reset = () => {
    setSharedValue(circleRadius, 0);
    setSharedValue(wipePosition, 0);
  };

  return {
    circleRadius,
    circleCenterX,
    circleCenterY,
    wipePosition,
    setCenter,
    run,
    reset,
  };
}

type ThemeSwitchAnimationValues = ReturnType<typeof useThemeSwitchAnimationValues>;

type ThemeSwitchMaskProps = {
  animationType: AnimationType;
  screenWidth: number;
  screenHeight: number;
  animationValues: ThemeSwitchAnimationValues;
};

function ThemeSwitchMask({ animationType, screenWidth, screenHeight, animationValues }: ThemeSwitchMaskProps) {
  switch (animationType) {
    case AnimationType.Circular:
      return (
        <Group>
          <Rect height={screenHeight} width={screenWidth} color='white' />
          <Circle cx={animationValues.circleCenterX} cy={animationValues.circleCenterY} r={animationValues.circleRadius} color='black' />
        </Group>
      );

    case AnimationType.CircularInverted:
      return (
        <Group>
          <Circle cx={animationValues.circleCenterX} cy={animationValues.circleCenterY} r={animationValues.circleRadius} color='white' />
        </Group>
      );

    case AnimationType.Wipe:
      return (
        <Group>
          <Rect height={screenHeight} width={screenWidth} color='white' />
          <Rect height={screenHeight} width={animationValues.wipePosition} color='black' />
        </Group>
      );

    case AnimationType.WipeRight:
      return (
        <Group>
          <Rect height={screenHeight} width={screenWidth} color='white' />
          <Rect x={animationValues.wipePosition} height={screenHeight} width={screenWidth} color='black' />
        </Group>
      );

    case AnimationType.WipeDown:
      return (
        <Group>
          <Rect height={screenHeight} width={screenWidth} color='white' />
          <Rect height={animationValues.wipePosition} width={screenWidth} color='black' />
        </Group>
      );

    case AnimationType.WipeUp:
      return (
        <Group>
          <Rect height={screenHeight} width={screenWidth} color='white' />
          <Rect y={animationValues.wipePosition} height={screenHeight} width={screenWidth} color='black' />
        </Group>
      );

    default:
      return (
        <Group>
          <Rect height={screenHeight} width={screenWidth} color='white' />
          <Rect height={screenHeight} width={animationValues.wipePosition} color='black' />
        </Group>
      );
  }
}

export const ThemeSwitcher = forwardRef<ThemeSwitcherRef, ThemeSwitcherProps>(
  (
    {
      theme,
      onThemeChange,
      children,
      animationDuration = DEFAULT_ANIMATION_DURATION,
      animationType = DEFAULT_ANIMATION_TYPE,
      style,
      onAnimationStart,
      onAnimationComplete,
      switchDelay = DEFAULT_SWITCH_DELAY,
      easing = DEFAULT_EASING,
    },
    ref,
  ) => {
    'use no memo';

    const pd = PixelRatio.get();
    const viewRef = useRef<View>(null);
    const [overlay, setOverlay] = useState<SkImage | null>(null);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const animationValues = useThemeSwitchAnimationValues(screenWidth, screenHeight);
    const [isAnimating, setIsAnimating] = useState(false);

    const animateThemeChange = async <T extends number, U extends number>(touchX?: T, touchY?: U): Promise<void> => {
      if (isAnimating) return;

      setIsAnimating(true);
      onAnimationStart?.();

      const centerX = touchX ?? screenWidth / 2;
      const centerY = touchY ?? screenHeight / 2;

      animationValues.setCenter(centerX, centerY);

      if (viewRef.current) {
        const snapshot = await makeImageFromView<View>(viewRef as React.RefObject<View>);
        setOverlay(snapshot);
      }

      await wait<number>(switchDelay);

      const newTheme: ThemeMode = theme === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark;
      onThemeChange(newTheme);

      const easingFn = getEasingFunction(easing);
      animationValues.run({
        type: animationType,
        centerX,
        centerY,
        screenWidth,
        screenHeight,
        duration: animationDuration,
        easing: easingFn,
      });

      await wait(animationDuration);

      setOverlay(null);
      setIsAnimating(false);
      onAnimationComplete?.();

      await wait(200);
      animationValues.reset();
    };

    useImperativeHandle(ref, () => ({
      animate: animateThemeChange,
    }));

    return (
      <View style={[styles.container, style]} ref={viewRef} collapsable={false}>
        {children}

        {overlay && (
          <Canvas style={[StyleSheet.absoluteFillObject, styles.overlayCanvas]}>
            <Mask
              mode='luminance'
              mask={
                <ThemeSwitchMask
                  animationType={animationType}
                  screenWidth={screenWidth}
                  screenHeight={screenHeight}
                  animationValues={animationValues}
                />
              }>
              <Image image={overlay} x={0} y={0} width={overlay.width() / pd} height={overlay.height() / pd} />
            </Mask>
          </Canvas>
        )}
      </View>
    );
  },
);
ThemeSwitcher.displayName = 'ThemeSwitcher';
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayCanvas: {
    pointerEvents: 'none',
  },
});
