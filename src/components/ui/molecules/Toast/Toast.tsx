import { CircleAlert, CircleCheck, CircleX, Info, type LucideIcon } from 'lucide-react-native';
import type { Toast as ToastType, ToastType as ToastVariant } from './Toast.types';
import { useToast } from './context/ToastContext';
import React, { useCallback, useEffect, useRef } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ToastProps {
  toast: ToastType;
  index: number;
  onHeightChange?: (id: string, height: number) => void;
}

const getBackgroundColor = (type: ToastVariant) => {
  switch (type) {
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#262626';
  }
};

const getIconForType = (type: ToastVariant): LucideIcon | null => {
  switch (type) {
    case 'success':
      return CircleCheck;
    case 'error':
      return CircleX;
    case 'warning':
      return CircleAlert;
    case 'info':
      return Info;
    default:
      return null;
  }
};
export const Toast: React.FC<ToastProps> = ({ toast, index }) => {
  const prevIndexRef = useRef<number>(-1);

  const { dismiss, expandedToasts, expandToast, collapseToast } = useToast();
  const opacity = useSharedValue<number>(1);
  const translateY = useSharedValue<number>(toast.options.position === 'top' ? -100 : 100);
  const scale = useSharedValue<number>(0.9);
  const rotateZ = useSharedValue<number>(0);
  const expandHeight = useSharedValue<number>(0);

  const isExpanded = expandedToasts.has(toast.id);
  const hasExpandedContent = !!toast.options.expandedContent;

  const getStackOffset = useCallback(() => {
    const baseOffset = 4;
    const maxOffset = 12;
    const offset = Math.min(index * baseOffset, maxOffset);
    return toast.options.position === 'top' ? offset : -offset;
  }, [index, toast.options.position]);

  const getStackScale = useCallback(() => {
    const scaleReduction = 0.02;
    const minScale = 0.92;
    return Math.max(1 - index * scaleReduction, minScale);
  }, [index]);

  useEffect(() => {
    if (prevIndexRef.current !== index && opacity.value > 0) {
      const soonerOffset = toast.options.position === 'top' ? 2 : -2;

      translateY.set(
        withTiming(getStackOffset() + soonerOffset, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
      );

      scale.set(
        withTiming(getStackScale() * 0.98, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
      );

      setTimeout(() => {
        translateY.set(
          withSpring(getStackOffset(), {
            damping: 25,
            stiffness: 120,
            mass: 0.8,
            velocity: 0,
          }),
        );

        scale.set(
          withSpring(getStackScale(), {
            damping: 25,
            stiffness: 120,
            mass: 0.8,
            velocity: 0,
          }),
        );
      }, 200);
    }

    prevIndexRef.current = index;
  }, [getStackOffset, getStackScale, index, opacity, scale, toast.options.position, translateY]);

  const handleDismiss = useCallback(() => {
    dismiss(toast.id);
    toast.options.onClose?.();
  }, [dismiss, toast.id, toast.options]);

  const animatedDismiss = () => {
    opacity.set(
      withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      }),
    );

    translateY.set(
      withTiming(toast.options.position === 'top' ? -50 : 50, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      }),
    );

    scale.set(
      withTiming(0.85, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      }),
    );

    setTimeout(() => {
      handleDismiss();
    }, 300);
  };

  useEffect(() => {
    const delay = index * 50;

    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    setTimeout(() => {
      // opacity.set(withTiming(1, {
      //   duration: 500,
      //   easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      // }));

      translateY.set(
        withSpring(getStackOffset(), {
          damping: 28,
          stiffness: 140,
          mass: 0.8,
          velocity: 0,
        }),
      );

      scale.set(
        withSpring(getStackScale(), {
          damping: 28,
          stiffness: 140,
          mass: 0.8,
          velocity: 0,
        }),
      );

      rotateZ.set(
        withTiming(0, {
          duration: 500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
      );
    }, delay);

    if (toast.options.duration > 0) {
      const exitDelay = Math.max(0, toast.options.duration - 500);

      const exitAnimations = () => {
        opacity.set(
          withTiming(0, {
            duration: 400,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
        );

        translateY.set(
          withTiming(20, {
            duration: 400,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
        );

        scale.set(
          withTiming(0.95, {
            duration: 400,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
        );

        setTimeout(() => {
          handleDismiss();
        }, 400);
      };

      setTimeout(exitAnimations, exitDelay);
    }
  }, [getStackOffset, getStackScale, handleDismiss, index, opacity, rotateZ, scale, toast, translateY]);

  // Animate expansion
  useEffect(() => {
    if (isExpanded && hasExpandedContent) {
      expandHeight.set(
        withSpring(1, {
          damping: 20,
          stiffness: 100,
        }),
      );
    } else {
      expandHeight.set(
        withSpring(0, {
          damping: 20,
          stiffness: 100,
        }),
      );
    }
  }, [isExpanded, hasExpandedContent, expandHeight]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }, { rotateZ: `${rotateZ.value}deg` }],
      zIndex: 1000 - index,
    };
  });

  const expandedContentStyle = useAnimatedStyle(() => {
    return {
      maxHeight: expandHeight.value * 300,
      opacity: expandHeight.value,
    };
  });

  const handlePress = () => {
    if (!hasExpandedContent) {
      return;
    }

    if (isExpanded) {
      collapseToast(toast.id);
    } else {
      expandToast(toast.id);
    }
  };

  const backgroundColor = toast.options.backgroundColor ?? getBackgroundColor(toast.options.type);

  const _styles = toast.options?.style || {};

  const icon = getIconForType(toast.options.type);

  const renderExpandedContent = () => {
    if (!hasExpandedContent) return null;

    const content = toast.options.expandedContent;

    if (typeof content === 'function') {
      return content({ dismiss: animatedDismiss });
    }

    return content;
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        animatedStyle,
        {
          marginTop: 0,
          marginBottom: 0,
          position: 'absolute',
          top: toast.options.position === 'top' ? 80 : undefined,
          bottom: toast.options.position === 'bottom' ? 0 : undefined,
        },
        _styles,
      ]}>
      <Pressable style={[styles.toast, { backgroundColor }]} onPress={handlePress} android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
        <View style={styles.mainContent}>
          {icon ? <ToastIcon icon={icon} /> : null}
          <View style={styles.contentContainer}>{typeof toast.content === 'string' ? <Text style={styles.text}>{toast.content}</Text> : toast.content}</View>
          {toast.options.action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                toast?.options?.action?.onPress!();
                animatedDismiss();
              }}>
              <Text style={styles.actionText}>{toast.options.action.label}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Expanded Content */}
        {hasExpandedContent && <Animated.View style={[styles.expandedContent, expandedContentStyle]}>{renderExpandedContent()}</Animated.View>}
      </Pressable>
    </Animated.View>
  );
};

function ToastIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <View style={styles.icon}>
      <Icon size={20} color='#FFFFFF' strokeWidth={2.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    marginVertical: 4,
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toast: {
    flexDirection: 'column',
    borderRadius: 12,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContent: {
    overflow: 'hidden',
  },
});
