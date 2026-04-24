import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { type LayoutChangeEvent, Text, View, type ViewStyle, type TextStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from 'theme';

type SlideActionProps = {
  label: string;
  onComplete: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
  resetKey?: string | number;
};

const THUMB_SIZE = 56;
const THUMB_GAP = 6;
const COMPLETE_THRESHOLD = 0.82;

const DANGER_GRADIENT = ['#FF5A68', '#FF2F4F'] as const;
const DANGER_PROGRESS_GRADIENT = ['rgba(255,62,95,0.58)', 'rgba(255,47,79,0.12)'] as const;
const PRIMARY_PROGRESS_GRADIENT = ['rgba(86,204,242,0.32)', 'rgba(47,128,237,0.08)'] as const;

export function SlideAction({ label, onComplete, icon, variant = 'primary', disabled = false, resetKey }: SlideActionProps) {
  const [isComplete, setIsComplete] = useState(false);
  const trackWidth = useSharedValue(0);
  const dragOffset = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const completed = useSharedValue(false);
  const thumbScale = useSharedValue(1);

  const thumbGradient = variant === 'primary' ? theme.gradients.primaryGradient : DANGER_GRADIENT;
  const progressGradient = variant === 'primary' ? PRIMARY_PROGRESS_GRADIENT : DANGER_PROGRESS_GRADIENT;

  const reset = useCallback(() => {
    setIsComplete(false);
    completed.value = false;
    thumbScale.value = 1;
    dragOffset.value = withTiming(0, { duration: 180 });
  }, [completed, dragOffset, thumbScale]);

  useEffect(() => {
    reset();
  }, [reset, resetKey]);

  const completeAction = useCallback(() => {
    setIsComplete(true);
    onComplete();
  }, [onComplete]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .activeOffsetX([-8, 8])
        .failOffsetY([-20, 20])
        .onStart(() => {
          dragStart.value = dragOffset.value;
          thumbScale.value = withSpring(1.03, { damping: 18, stiffness: 260 });
        })
        .onUpdate(event => {
          const max = Math.max(0, trackWidth.value - THUMB_SIZE - THUMB_GAP * 2);
          const next = Math.min(max, Math.max(0, dragStart.value + event.translationX));
          dragOffset.value = next;
        })
        .onEnd(() => {
          thumbScale.value = withSpring(1, { damping: 16, stiffness: 220 });

          const max = Math.max(0, trackWidth.value - THUMB_SIZE - THUMB_GAP * 2);
          if (max <= 0) {
            dragOffset.value = 0;
            return;
          }

          const progress = dragOffset.value / max;
          if (progress >= COMPLETE_THRESHOLD && !completed.value) {
            completed.value = true;
            dragOffset.value = withTiming(max, { duration: 120 }, finished => {
              if (finished) {
                runOnJS(completeAction)();
              }
            });
            return;
          }

          dragOffset.value = withSpring(0, { damping: 18, stiffness: 230, mass: 0.9 });
        }),
    [completeAction, completed, disabled, dragOffset, dragStart, thumbScale, trackWidth],
  );

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragOffset.value }, { scale: thumbScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => {
    const progress = Math.max(0, trackWidth.value - THUMB_SIZE - THUMB_GAP * 2)
      ? dragOffset.value / Math.max(1, trackWidth.value - THUMB_SIZE - THUMB_GAP * 2)
      : 0;

    return {
      opacity: 0.72 + progress * 0.2,
      transform: [{ scale: interpolate(progress, [0, 1], [1, 1.08]) }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    const max = Math.max(1, trackWidth.value - THUMB_SIZE - THUMB_GAP * 2);
    const progress = dragOffset.value / max;

    return {
      width: dragOffset.value + THUMB_SIZE + THUMB_GAP * 2,
      opacity: interpolate(progress, [0, 1], [0.72, 1]),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const max = Math.max(1, trackWidth.value - THUMB_SIZE - THUMB_GAP * 2);
    const progress = dragOffset.value / max;

    return {
      opacity: interpolate(progress, [0, 0.7, 1], [1, 0.92, 0.76]),
      transform: [{ translateX: interpolate(progress, [0, 1], [0, 10]) }],
    };
  });

  const onTrackLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  };

  return (
    <View style={[trackBaseStyle, variant === 'danger' ? dangerTrackStyle : primaryTrackStyle, disabled ? trackDisabledStyle : undefined]} onLayout={onTrackLayout}>
      <Animated.View style={[progressFillStyle, progressStyle]}>
        <LinearGradient colors={progressGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={progressGradientStyle} />
      </Animated.View>

      <Animated.View style={[labelWrapStyle, labelStyle]} pointerEvents='none'>
        <Text style={[labelBaseStyle, variant === 'danger' ? labelDangerStyle : labelPrimaryStyle]}>
          {isComplete ? 'Đang xử lý' : label}
        </Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[thumbWrapStyle, thumbStyle]}>
          <Animated.View style={[thumbGlowStyle, variant === 'danger' ? thumbGlowDangerStyle : thumbGlowPrimaryStyle, glowStyle]} />
          <LinearGradient colors={thumbGradient} start={{ x: 0.08, y: 0.08 }} end={{ x: 0.92, y: 0.92 }} style={thumbGradientStyle}>
            {icon ?? <ChevronRight size={24} color={theme.colors.textPrimary} strokeWidth={3.1} />}
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const trackBaseStyle: ViewStyle = {
  height: 68,
  borderRadius: theme.radius.pill,
  overflow: 'hidden',
  justifyContent: 'center',
  borderWidth: 1.15,
};

const primaryTrackStyle: ViewStyle = {
  backgroundColor: 'rgba(4,10,18,0.92)',
  borderColor: 'rgba(122,198,255,0.22)',
  shadowColor: '#000000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 14 },
  shadowRadius: 22,
  elevation: 8,
};

const dangerTrackStyle: ViewStyle = {
  backgroundColor: 'rgba(4,9,18,0.98)',
  borderColor: 'rgba(255,120,145,0.46)',
  shadowColor: '#FF3356',
  shadowOpacity: 0.26,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 18,
  elevation: 10,
};

const trackDisabledStyle: ViewStyle = {
  opacity: 0.6,
};

const progressFillStyle: ViewStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  borderRadius: theme.radius.pill,
  overflow: 'hidden',
};

const progressGradientStyle: ViewStyle = {
  flex: 1,
  borderRadius: theme.radius.pill,
};

const labelWrapStyle: ViewStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 74,
};

const labelBaseStyle: TextStyle = {
  textAlign: 'center',
  ...theme.typography.bodyStrong,
  fontSize: 21,
  lineHeight: 24,
  fontWeight: '700',
  letterSpacing: 0.2,
};

const labelPrimaryStyle: TextStyle = {
  color: 'rgba(231,245,255,0.94)',
};

const labelDangerStyle: TextStyle = {
  color: '#FFF6F8',
};

const thumbGlowStyle: ViewStyle = {
  position: 'absolute',
  left: -10,
  top: -10,
  width: THUMB_SIZE + 20,
  height: THUMB_SIZE + 20,
  borderRadius: theme.radius.pill,
};

const thumbGlowPrimaryStyle: ViewStyle = {
  backgroundColor: 'rgba(86,204,242,0.22)',
  shadowColor: theme.colors.primary,
  shadowOpacity: 0.42,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 20,
  elevation: 10,
};

const thumbGlowDangerStyle: ViewStyle = {
  backgroundColor: 'rgba(255,38,74,0.22)',
  shadowColor: '#FF2B4E',
  shadowOpacity: 0.86,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 34,
  elevation: 14,
};

const thumbWrapStyle: ViewStyle = {
  position: 'absolute',
  width: THUMB_SIZE,
  height: THUMB_SIZE,
  top: THUMB_GAP,
  left: THUMB_GAP,
  borderRadius: theme.radius.pill,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'visible',
};

const thumbGradientStyle: ViewStyle = {
  width: THUMB_SIZE,
  height: THUMB_SIZE,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.radius.pill,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  shadowColor: '#FF2F4F',
  shadowOpacity: 0.38,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 18,
  elevation: 12,
};
