import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { scheduleOnRN } from 'react-native-worklets';
import type { RotateCarouselItemProps, RotateCarouselProps } from './types';
import Animated, {
  Extrapolation,
  interpolate,
  useDerivedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.7;
const SPACING = 20;
const SIDE_SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

const RotateCarouselItem = <ItemT,>({
  item,
  index,
  scrollX,
  renderItem,
  itemWidth = ITEM_WIDTH,
  spacing = SPACING,
  rotatePercentage = 90,
}: RotateCarouselItemProps<ItemT>) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * itemWidth,
      index * itemWidth,
      (index + 1) * itemWidth,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolation.CLAMP,
    );

    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [-rotatePercentage, 0, -rotatePercentage],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );

    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [itemWidth * 0.2, 0, -itemWidth * 0.2],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { perspective: 1200 },
        { scale },
        { rotateY: `${rotateY}deg` },
        { translateX },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        animatedStyle,
        {
          width: itemWidth,
        },
      ]}
    >
      <View
        style={[
          styles.itemContent,
          {
            width: itemWidth - spacing * 2,
          },
        ]}
      >
        {renderItem({ item, index })}
      </View>
    </Animated.View>
  );
};

const RotateCarousel = <ItemT,>({
  data,
  renderItem,
  horizontalSpacing = SIDE_SPACING,
  itemWidth = ITEM_WIDTH,
  spacing = SPACING,
  rotatePercentage = 90,
  keyExtractor,
  onIndexChange,
}: RotateCarouselProps<ItemT>) => {
  const scrollX = useSharedValue(0);
  const previousIndex = useSharedValue(-1);

  useDerivedValue(() => {
    if (data.length === 0) {
      return;
    }

    const currentIndex = Math.min(data.length - 1, Math.max(0, Math.round(scrollX.value / itemWidth)));

    if (currentIndex !== previousIndex.value && previousIndex.value !== -1 && onIndexChange) {
      scheduleOnRN(onIndexChange, currentIndex);
    }

    previousIndex.value = currentIndex;
  }, [data.length, itemWidth, onIndexChange]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <Animated.FlatList
      data={data}
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      keyExtractor={
        keyExtractor
          ? (item, index) => keyExtractor(item, index)
          : (_, index) => index.toString()
      }
      horizontal
      pagingEnabled
      snapToInterval={itemWidth}
      decelerationRate='fast'
      disableIntervalMomentum
      contentContainerStyle={{
        paddingHorizontal: horizontalSpacing,
      }}
      style={{
        flexGrow: 0,
      }}
      renderItem={({ item, index }) => (
        <RotateCarouselItem
          item={item}
          index={index}
          scrollX={scrollX}
          renderItem={renderItem}
          itemWidth={itemWidth}
          spacing={spacing}
          rotatePercentage={rotatePercentage}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
});

export { RotateCarousel, RotateCarouselItemProps, RotateCarouselProps };
