import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

export type CircularCarouselProps<ItemT> = {
  data: readonly ItemT[];
  renderItem: (info: { item: ItemT; index: number }) => ReactNode;
  keyExtractor?: (item: ItemT, index: number) => string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  spacing?: number;
  itemWidth?: number;
  horizontalSpacing?: number;
  onIndexChange?: (index: number) => void;
};

export interface CircularCarouselItemProps<ItemT> {
  item: ItemT;
  index: number;
  scrollX: SharedValue<number>;
  renderItem: (info: { item: ItemT; index: number }) => ReactNode;
  spacing?: number;
  itemWidth?: number;
}
