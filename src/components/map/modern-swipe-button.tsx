import { ChevronRight } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import SwipeButton from 'rn-swipe-button';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { ThemedText } from 'components/themed-text';

type ModernSwipeButtonProps = {
  label: string;
  completeLabel?: string;
  disabled?: boolean;
  tone?: 'start' | 'finish';
  onComplete: () => void;
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function ShimmerTitle({ label, color }: { label: string; color: string }) {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 2200 }),
      -1,
      false
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [0, 1], [-150, 150]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.shimmerContainer}>
      <ThemedText style={[styles.title, { color }]}>
        {label}
      </ThemedText>
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
        <AnimatedLinearGradient
          colors={['transparent', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.shimmerGradient, animatedStyle]}
        />
      </View>
    </View>
  );
}

export function ModernSwipeButton({
  label,
  completeLabel = 'Release',
  disabled,
  tone = 'start',
  onComplete,
}: ModernSwipeButtonProps) {
  const isFinish = tone === 'finish';

  const gradientColors = isFinish 
    ? (['#FF4D4D', '#D32F2F'] as const) 
    : (['#FF8A00', '#FF5A1F'] as const);

  return (
    <View style={styles.container}>
      <SwipeButton
        onSwipeSuccess={onComplete}
        railBackgroundColor={isFinish ? '#2B2021' : '#F1F2F4'}
        railBorderColor='transparent'
        railFillBackgroundColor={isFinish ? 'rgba(255, 77, 77, 0.15)' : 'rgba(255, 90, 31, 0.1)'}
        railFillBorderColor='transparent'
        thumbIconBackgroundColor='transparent'
        thumbIconBorderColor='transparent'
        thumbIconComponent={() => (
          <View style={styles.thumbWrapper} pointerEvents="none">
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.thumbGradient}
            >
              <ChevronRight size={24} color='#FFFFFF' strokeWidth={3.5} />
            </LinearGradient>
          </View>
        )}
        titleComponent={() => (
          <ShimmerTitle 
            label={disabled ? (completeLabel || label) : label} 
            color={isFinish ? '#E5484D' : '#4B5563'} 
          />
        )}
        thumbIconWidth={60}
        height={64}
        swipeSuccessThreshold={75}
        railStyles={styles.rail}
        containerStyles={styles.swipeContainer}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  swipeContainer: {
    borderRadius: 32,
    borderWidth: 0,
    overflow: 'hidden',
    backgroundColor: '#F1F2F4',
  },
  rail: {
    borderRadius: 32,
    borderWidth: 0,
  },
  thumbWrapper: {
    width: 60,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  shimmerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 30, // Minimal padding to offset the thumb handle
  },
  shimmerGradient: {
    width: 200,
    height: '100%',
  },
});
