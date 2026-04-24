import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Map, MessageCircleMore, UserRound, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from 'theme';

type ExpoTabOptions = BottomTabBarProps['descriptors'][string]['options'] & {
  href?: string | null;
};

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_ICONS: Record<string, LucideIcon> = {
  index: Map,
  add: UserRound,
  chat: MessageCircleMore,
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12);

  const routes = state.routes
    .map((route, index) => ({ route, index, options: descriptors[route.key].options as ExpoTabOptions }))
    .filter(({ options }) => options.href !== null);

  return (
    <View pointerEvents='box-none' style={[styles.wrapper, { bottom }]}>
      <View style={styles.navBar}>
        {routes.map(({ route, index, options }) => {
          const label = getRouteLabel(options, route.name);
          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name] ?? Map;
          const iconColor = isFocused ? theme.colors.textPrimary : theme.colors.textSecondary;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <AnimatedPressable
              key={route.key}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole='button'
              accessibilityState={isFocused ? { selected: true } : undefined}
              layout={LinearTransition.springify().mass(0.5)}
              onPress={onPress}
              style={[styles.tabItem, isFocused ? styles.activeTabItem : styles.inactiveTabItem]}>
              {isFocused && (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primary2]}
                  start={{ x: 0.05, y: 0.08 }}
                  end={{ x: 0.95, y: 0.92 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Icon size={20} color={iconColor} strokeWidth={isFocused ? 2.6 : 2.2} />
              {isFocused && (
                <AnimatedText entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} numberOfLines={1} style={styles.activeLabel}>
                  {label}
                </AnimatedText>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

function getRouteLabel(options: ExpoTabOptions, routeName: string) {
  const label = options.tabBarLabel ?? options.title ?? routeName;
  return typeof label === 'string' ? label : typeof options.title === 'string' ? options.title : routeName;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 50,
    alignItems: 'center',
  },
  navBar: {
    width: '100%',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    shadowColor: theme.colors.surfaceElevated,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  tabItem: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  activeTabItem: {
    flex: 1,
    paddingHorizontal: 12,
  },
  inactiveTabItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    // paddingHorizontal: 12,
    // backgroundColor: 'rgba(255,255,255,0.04)',
  },
  activeLabel: {
    maxWidth: 104,
    color: theme.colors.textPrimary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
