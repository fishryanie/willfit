type BlurTint = import('expo-blur').BlurTint;
type FC<P = Record<string, never>> = import('react').FC<P>;
type MutableRefObject<T> = import('react').MutableRefObject<T>;
type PropsWithChildren<P = unknown> = import('react').PropsWithChildren<P>;
type ReactElement = import('react').ReactElement;
type ReactNode = import('react').ReactNode;
type DimensionValue = import('react-native').DimensionValue;
type StyleProp<T> = import('react-native').StyleProp<T>;
type TextInputProps = import('react-native').TextInputProps;
type TextStyle = import('react-native').TextStyle;
type ViewProps = import('react-native').ViewProps;
type ViewStyle = import('react-native').ViewStyle;
type SharedValue<T> = import('react-native-reanimated').SharedValue<T>;
type WithSpringConfig = import('react-native-reanimated').WithSpringConfig;
type RuntimeAnimationType = import('constants/theme').AnimationType;
type RuntimeEasingType = import('constants/theme').EasingType;
type RuntimeThemeMode = import('constants/theme').ThemeMode;

  type ThemeMode = RuntimeThemeMode;
  type AnimationType = RuntimeAnimationType;
  type EasingType = RuntimeEasingType;

  type ThemeColorName =
    | 'background'
    | 'foreground'
    | 'card'
    | 'text'
    | 'textSecondary'
    | 'border'
    | 'primary'
    | 'primaryForeground'
    | 'secondary'
    | 'secondaryForeground'
    | 'accent'
    | 'accentForeground'
    | 'destructive'
    | 'destructiveForeground'
    | 'muted'
    | 'mutedForeground'
    | 'success'
    | 'warning'
    | 'info'
    | 'tint'
    | 'icon'
    | 'tabIconDefault'
    | 'tabIconSelected'
    | 'error';

  type ThemeColors = Record<ThemeColorName, string>;

  interface ThemeAnimation {
    type: AnimationType;
    duration: number;
    easing: EasingType;
  }

  interface ThemeOptions {
    readonly touchX?: number;
    readonly touchY?: number;
    readonly animationType?: AnimationType;
    readonly animationDuration?: number;
    readonly easing?: EasingType;
  }

  interface ThemeConfig {
    mode: ThemeMode;
    colors: ThemeColors;
    animationType: AnimationType;
    animationDuration: number;
    easing: EasingType;
  }

  interface ThemeController {
    theme: ThemeMode;
    colors: ThemeColors;
    config: ThemeConfig;
    toggleTheme: (options?: ThemeOptions) => Promise<void>;
    setTheme: (theme: ThemeMode) => void;
    isDark: boolean;
    isLight: boolean;
  }

  interface ThemeSwitcherRef {
    animate: (touchX?: number, touchY?: number) => Promise<void>;
  }

  interface ThemeSwitcherProps {
    theme: ThemeMode;
    onThemeChange: (newTheme: ThemeMode) => void;
    children: ReactNode;
    animationDuration?: number;
    readonly animationType?: AnimationType;
    readonly style?: StyleProp<ViewStyle>;
    readonly onAnimationStart?: () => void;
    readonly onAnimationComplete?: () => void;
    readonly switchDelay?: number;
    readonly easing?: EasingType;
  }

  interface ThemeProviderProps {
    children: ReactNode;
    readonly onThemeChange?: (theme: ThemeMode) => void;
    readonly onAnimationStart?: () => void;
    readonly onAnimationComplete?: () => void;
  }

  type Coordinate = {
    latitude: number;
    longitude: number;
  };

  type ActivityMode = 'run' | 'ride' | 'walk' | 'hike';

  type MapLayer = 'standard' | 'satellite';

  type RouteSummary = {
    id: string;
    title: string;
    distanceKm: number;
    elevationM: number;
    estimatedMinutes: number;
    surface: string;
    popularity: number;
  };

  type SegmentSummary = {
    id: string;
    title: string;
    distanceKm: number;
    grade: string;
    bestTime: string;
    starred: boolean;
    coordinates: Coordinate[];
  };

  type RouteMapProps = {
    center: Coordinate;
    routeCoordinates: Coordinate[];
    liveCoordinates: Coordinate[];
    waypoints: Coordinate[];
    heatRoutes: Coordinate[][];
    segments: SegmentSummary[];
    selectedSegmentId?: string;
    showHeatmap: boolean;
    showSegments: boolean;
    mapLayer: MapLayer;
    activityMode: ActivityMode;
    followUser: boolean;
    onMapPress: (coordinate: Coordinate) => void;
  };

  interface ScrollableSearchContextValue {
    isFocused: boolean;
    setIsFocused: (focused: boolean) => void;
    scrollY: SharedValue<number>;
    pullDistance: SharedValue<number>;
    shouldAutoFocus: SharedValue<boolean>;
    onPullToFocusCallback: MutableRefObject<(() => void) | null>;
  }

  type ScrollableSearchRootProps = PropsWithChildren;
  type ScrollableSearchFocusedScreenProps = PropsWithChildren;

  interface ScrollableSearchScrollContentProps {
    children: ReactNode;
    readonly pullThreshold?: number;
    readonly contentContainerStyle?: StyleProp<ViewStyle>;
  }

  interface ScrollableSearchAnimatedComponentProps {
    children: ReactNode;
    readonly focusedOffset?: number;
    readonly unfocusedOffset?: number;
    readonly enablePullEffect?: boolean;
    readonly onPullToFocus?: () => void;
    readonly springConfig?: WithSpringConfig;
  }

  interface ScrollableSearchOverlayProps {
    readonly children?: ReactNode;
    readonly onPress?: () => void;
    readonly enableBlur?: boolean;
    readonly blurTint?: BlurTint;
    readonly maxBlurIntensity?: number;
  }

  interface AnimatedMaskedTextProps {
    children: string;
    readonly speed?: number;
    readonly colors?: string[];
    readonly baseTextColor?: string;
    readonly style?: StyleProp<TextStyle>;
  }

  interface SearchBarProps extends Omit<TextInputProps, 'style' | 'onChangeText'> {
    placeholder?: string;
    onSearch?: (query: string) => void;
    onClear?: () => void;
    style?: ViewStyle;
    inputStyle?: TextStyle;
    width?: DimensionValue;
    maxWidth?: number;
    parentHeight?: number | 40;
    tint?: string;
    iconPadding?: number;
    renderTrailingIcons?: () => ReactNode;
    renderLeadingIcons?: () => ReactNode;
    onSearchDone?: () => void;
    onSearchMount?: () => void;
    containerWidth?: number;
    focusedWidth?: number;
    cancelButtonWidth?: number;
    iconStyle?: StyleProp<ViewStyle>;
    enableWidthAnimation?: boolean;
    centerWhenUnfocused?: boolean;
    textCenterOffset?: number;
    iconCenterOffset?: number;
    autoFocusOnMount?: boolean;
  }

  type CircularCarouselProps<ItemT> = {
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

  interface CircularCarouselItemProps<ItemT> {
    item: ItemT;
    index: number;
    scrollX: SharedValue<number>;
    renderItem: (info: { item: ItemT; index: number }) => ReactNode;
    spacing?: number;
    itemWidth?: number;
  }

  type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';
  type ToastPosition = 'top' | 'bottom';

  interface ExpandedToastContentProps {
    dismiss: () => void;
  }

  interface ToastOptions {
    duration?: number;
    type?: ToastType;
    position?: ToastPosition;
    onClose?: () => void;
    action?: {
      label: string;
      onPress: () => void;
    } | null;
    expandedContent?: ReactNode | ((props: ExpandedToastContentProps) => ReactNode);
    backgroundColor?: string;
    style?: StyleProp<ViewStyle>;
  }

  interface ToastItem {
    id: string;
    content: ReactNode | string;
    options: Required<ToastOptions>;
  }

  interface ToastContextValue {
    toasts: ToastItem[];
    show: (content: ReactNode | string, options?: ToastOptions) => string;
    update: (id: string, content: ReactNode | string, options?: ToastOptions) => void;
    dismiss: (id: string) => void;
    dismissAll: () => void;
    expandedToasts: Set<string>;
    expandToast: (id: string) => void;
    collapseToast: (id: string) => void;
  }

  interface ToastProviderWithViewportProps {
    children: ReactNode;
  }

  interface ToastViewProps {
    toast: ToastItem;
    index: number;
    onHeightChange?: (id: string, height: number) => void;
  }

  interface CircularProgressProps {
    progress: SharedValue<number>;
    readonly size?: number;
    readonly strokeWidth?: number;
    readonly outerCircleColor?: string;
    readonly progressCircleColor?: string;
    readonly backgroundColor?: string;
    readonly onPress?: () => void;
    readonly gap?: number;
    readonly renderIcon?: () => ReactNode;
  }

  interface DialogContextValue {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }

  interface DialogProps {
    children: ReactNode;
    readonly defaultOpen?: boolean;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
  }

  interface DialogTriggerProps {
    children: ReactNode;
    readonly asChild?: boolean;
  }

  interface DialogContentProps {
    children: ReactNode;
    readonly onClose?: () => void;
    readonly dismissible?: boolean;
    readonly backdropBlurAmount?: number;
    readonly backdropColor?: string;
    readonly backdropBlurType?: BlurTint;
  }

  interface DialogCloseProps {
    children: ReactNode;
    readonly asChild?: boolean;
  }

  interface DialogBackdropProps {
    readonly children?: ReactNode;
    readonly blurAmount?: number;
    readonly backgroundColor?: string;
    readonly blurType?: BlurTint;
  }

  interface DialogComponent extends FC<DialogProps> {
    Trigger: FC<DialogTriggerProps>;
    Content: FC<DialogContentProps>;
    Close: FC<DialogCloseProps>;
    Backdrop: FC<DialogBackdropProps>;
  }

  interface ExtendedDialogContextValue extends DialogContextValue {
    closeDialog: () => void;
    animationProgress: SharedValue<number>;
  }

  interface ExtendedDialogContentProps extends DialogContentProps {
    readonly isAnimating?: boolean;
    readonly setIsAnimating?: (animating: boolean) => void;
  }

  interface RippleImageProps {
    width: number;
    height: number;
    source: string;
    readonly amplitude?: number;
    readonly frequency?: number;
    readonly decay?: number;
    readonly speed?: number;
    readonly duration?: number;
    readonly borderRadius?: number;
    readonly style?: StyleProp<ViewStyle>;
    readonly fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scaleDown';
  }

  interface RippleRectProps {
    width: number;
    height: number;
    color: string;
    readonly amplitude?: number;
    readonly frequency?: number;
    readonly decay?: number;
    readonly speed?: number;
    readonly duration?: number;
    readonly borderRadius?: number;
    readonly style?: StyleProp<ViewStyle>;
    readonly childrenPointerEvents?: ViewProps['pointerEvents'];
    readonly children?: ReactNode;
  }

  interface RippleSkiaEffectProps {
    width: number;
    height: number;
    readonly children?: ReactNode;
    readonly amplitude?: number;
    readonly frequency?: number;
    readonly decay?: number;
    readonly speed?: number;
    readonly duration?: number;
    readonly borderRadius?: number;
    readonly style?: StyleProp<ViewStyle>;
  }

  type RippleOptions = Required<Pick<RippleImageProps, 'amplitude' | 'frequency' | 'speed' | 'decay' | 'duration' | 'width' | 'height'>>;

  interface RollingCounterDigitProps {
    place: number;
    counterValue: SharedValue<number>;
    height: number;
    width: number;
    digitStyle?: StyleProp<TextStyle>;
    color?: string;
    fontSize?: number;
    springConfig: Partial<WithSpringConfig>;
  }

  interface RollingCounterProps {
    value: number | SharedValue<number>;
    height?: number;
    width?: number;
    digitStyle?: StyleProp<TextStyle>;
    springConfig?: Partial<WithSpringConfig>;
    fontSize?: number;
    color?: string;
  }
declare module 'components/map/route-map' {
  export function RouteMap(props: RouteMapProps): ReactElement;
}
