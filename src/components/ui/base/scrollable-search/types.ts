import type { SharedValue, WithSpringConfig } from "react-native-reanimated";
import * as React from "react";
import type { BlurTint } from "expo-blur";
import type { StyleProp, ViewStyle } from "react-native";

interface IScrollableSearchContext {
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  scrollY: SharedValue<number>;
  pullDistance: SharedValue<number>;
  shouldAutoFocus: SharedValue<boolean>;
  onPullToFocusCallback: React.MutableRefObject<(() => void) | null>;
}

interface IScrollContent {
  children: React.ReactNode;
  readonly pullThreshold?: number;
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
}
interface IAnimatedComponent {
  children: React.ReactNode;
  readonly focusedOffset?: number;
  readonly unfocusedOffset?: number;
  readonly enablePullEffect?: boolean;
  readonly onPullToFocus?: () => void;
  readonly springConfig?: WithSpringConfig;
}

interface IOverlay {
  readonly children?: React.ReactNode;
  readonly onPress?: () => void;
  readonly enableBlur?: boolean;
  readonly blurTint?: BlurTint;
  readonly maxBlurIntensity?: number;
}

type IFocusedScreen = React.PropsWithChildren;
type IScrollableSearch = React.PropsWithChildren;

export type {
  IScrollableSearchContext,
  IScrollContent,
  IAnimatedComponent,
  IOverlay,
  IFocusedScreen,
  IScrollableSearch,
};
