import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import SwipeButton from 'rn-swipe-button';

import { ThemedView } from 'components/themed-view';
import { AnimatedMaskedText } from 'components/ui/molecules/animated-masked-text/AnimatedMaskedText';
import { RippleRect } from 'components/ui/organisms/skia-ripple';

type ModernSwipeButtonProps = {
  label: string;
  completeLabel?: string;
  disabled?: boolean;
  tone?: 'start' | 'finish';
  onComplete: () => void;
};

const BUTTON_HEIGHT = 64;

function MaskedSwipeTitle({ label, color, isFinish }: { label: string; color: string; isFinish: boolean }) {
  return (
    <ThemedView backgroundColor='transparent' style={styles.titleContainer} pointerEvents='none'>
      <AnimatedMaskedText
        speed={1.35}
        baseTextColor={color}
        colors={
          isFinish
            ? ['transparent', 'rgba(255, 130, 130, 0.35)', '#FFFFFF', 'rgba(255, 130, 130, 0.24)', 'transparent']
            : ['transparent', 'rgba(255, 138, 0, 0.35)', '#FFFFFF', 'rgba(255, 90, 31, 0.24)', 'transparent']
        }
        style={styles.title}>
        {label}
      </AnimatedMaskedText>
    </ThemedView>
  );
}

export function ModernSwipeButton({ label, completeLabel = 'Release', disabled, tone = 'start', onComplete }: ModernSwipeButtonProps) {
  const isFinish = tone === 'finish';
  const [buttonWidth, setButtonWidth] = useState(0);

  const gradientColors = isFinish ? (['#FF4D4D', '#D32F2F'] as const) : (['#FF8A00', '#FF5A1F'] as const);
  const railBackgroundColor = isFinish ? '#2B2021' : '#F1F2F4';
  const titleColor = isFinish ? '#E5484D' : '#4B5563';

  const swipeButton = (
    <ThemedView backgroundColor='transparent' style={styles.swipeLayer} pointerEvents='box-none'>
      <SwipeButton
        onSwipeSuccess={() => {
          // Grant 200ms for the library to finish its internal success animation
          // before we trigger status changes that might unmount this component.
          setTimeout(() => {
            onComplete();
          }, 200);
        }}
        railBackgroundColor='transparent'
        railBorderColor='transparent'
        railFillBackgroundColor={isFinish ? 'rgba(255, 77, 77, 0.15)' : 'rgba(255, 90, 31, 0.1)'}
        railFillBorderColor='transparent'
        thumbIconBackgroundColor='transparent'
        thumbIconBorderColor='transparent'
        thumbIconComponent={() => (
          <ThemedView backgroundColor='transparent' style={styles.thumbWrapper} pointerEvents='none'>
            <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumbGradient}>
              <ChevronRight size={24} color='#FFFFFF' strokeWidth={3.5} />
            </LinearGradient>
          </ThemedView>
        )}
        titleComponent={() => <MaskedSwipeTitle label={disabled ? completeLabel || label : label} color={titleColor} isFinish={isFinish} />}
        thumbIconWidth={60}
        height={BUTTON_HEIGHT}
        swipeSuccessThreshold={75}
        railStyles={styles.rail}
        containerStyles={styles.swipeContainer}
        disabled={disabled}
      />
    </ThemedView>
  );

  return (
    <ThemedView
      backgroundColor='transparent'
      style={styles.container}
      onLayout={event => {
        const nextWidth = Math.round(event.nativeEvent.layout.width);
        if (nextWidth > 0 && nextWidth !== buttonWidth) {
          setButtonWidth(nextWidth);
        }
      }}>
      {buttonWidth > 0 ? (
        <RippleRect
          width={buttonWidth}
          height={BUTTON_HEIGHT}
          color={railBackgroundColor}
          borderRadius={32}
          amplitude={isFinish ? 9 : 7}
          frequency={isFinish ? 18 : 15}
          decay={7}
          speed={980}
          duration={2.8}
          childrenPointerEvents='box-none'>
          {swipeButton}
        </RippleRect>
      ) : (
        <ThemedView style={[styles.fallbackRail, { backgroundColor: railBackgroundColor }]}>{swipeButton}</ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  swipeLayer: {
    width: '100%',
    height: BUTTON_HEIGHT,
  },
  fallbackRail: {
    height: BUTTON_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
  },
  swipeContainer: {
    borderRadius: 32,
    borderWidth: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
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
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 30,
  },
});
