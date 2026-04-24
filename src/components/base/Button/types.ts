import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface IButton {
  children: ReactNode;
  readonly isLoading?: boolean;
  readonly onPress?: () => void;
  readonly width?: number;
  readonly height?: number;
  readonly backgroundColor?: string;
  readonly loadingTextBackgroundColor?: string;
  readonly loadingText?: string;
  readonly loadingTextColor?: string;
  readonly loadingTextSize?: number;
  readonly showLoadingIndicator?: boolean;
  readonly renderLoadingIndicator?: () => ReactNode;
  readonly borderRadius?: number;
  readonly gradientColors?: readonly string[];
  readonly style?: StyleProp<ViewStyle>;
  readonly loadingTextStyle?: StyleProp<TextStyle>;
  readonly withPressAnimation?: boolean;
  readonly animationDuration?: number;
  readonly disabled?: boolean;
}
