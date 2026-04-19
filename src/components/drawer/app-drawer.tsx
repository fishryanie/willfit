import { useRouter, usePathname, type Href } from 'expo-router';
import {
  Bell,
  CircleUserRound,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';
import React, {
  createContext,
  Fragment,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';

type DrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

type DrawerItem = {
  name: string;
  icon: LucideIcon;
  href?: Href;
};

const DRAWER_ITEMS: DrawerItem[] = [
  {
    name: 'My Profile',
    icon: CircleUserRound,
    href: '/chat',
  },
  {
    name: 'Settings',
    icon: Settings,
    href: '/modal',
  },
  {
    name: 'Logout',
    icon: LogOut,
  },
];

const THEME_OPTIONS = [
  { key: 'system', label: 'System', icon: Monitor },
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
] as const;

type ThemeOption = (typeof THEME_OPTIONS)[number]['key'];

const AppDrawerContext = createContext<DrawerContextValue | undefined>(undefined);

export function useAppDrawer() {
  const context = useContext(AppDrawerContext);

  if (!context) {
    throw new Error('useAppDrawer must be used inside AppDrawerProvider');
  }

  return context;
}

export function AppDrawerProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [themeOption, setThemeOption] = useState<ThemeOption>('system');
  const active = useSharedValue(false);

  const drawerTheme = themeOption === 'system' ? colorScheme : themeOption;
  const isDarkDrawer = drawerTheme === 'dark';
  const drawerBackgroundColor = isDarkDrawer ? '#24294A' : '#FFFFFF';
  const drawerTextColor = isDarkDrawer ? '#FFFFFF' : '#24294A';
  const drawerMutedColor = isDarkDrawer ? 'rgba(255,255,255,0.6)' : '#808080';

  const progress = useDerivedValue(() => withTiming(active.value ? 1 : 0));

  const animatedContentStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(progress.value, [0, 1], [0, -15], Extrapolation.CLAMP);

    return {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: '#1D2733',
      borderRadius: active.value ? withTiming(28) : withTiming(0),
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: active.value ? withTiming(0.7) : withTiming(1) },
        { translateX: active.value ? withSpring(width * 0.78) : withTiming(0) },
      ],
    };
  });

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    display: active.value ? 'flex' : 'none',
  }));

  const themePillStyle = useMemo(
    () => [
      styles.themePill,
      {
        backgroundColor: isDarkDrawer ? 'rgba(0,0,0,0.22)' : '#F0F0F0',
      },
    ],
    [isDarkDrawer],
  );

  const openDrawer = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onPressItem = useCallback(
    (item: DrawerItem) => {
      closeDrawer();

      if (item.href) {
        router.push(item.href);
      }
    },
    [closeDrawer, router],
  );

  useEffect(() => {
    active.value = isOpen;
  }, [active, isOpen]);

  const contextValue = useMemo(
    () => ({
      openDrawer,
      closeDrawer,
    }),
    [closeDrawer, openDrawer],
  );

  return (
    <AppDrawerContext.Provider value={contextValue}>
      <ThemedView flex backgroundColor={drawerBackgroundColor}>
        <ThemedView
          absoluteFillObject
          paddingTop={insets.top + 96}
          paddingHorizontal={30}
          maxWidth={210}
          backgroundColor={drawerBackgroundColor}>
          <ThemedView
            gap={6}
            marginBottom={12}
            paddingBottom={14}
            borderBottomWidth={StyleSheet.hairlineWidth}
            borderBottomColor={isDarkDrawer ? 'rgba(255,255,255,0.18)' : 'rgba(36,41,74,0.14)'}
            backgroundColor='transparent'>
            <ThemedText style={[styles.drawerTitle, { color: drawerTextColor }]}>Sofia</ThemedText>
            <ThemedText style={[styles.drawerSubtitle, { color: drawerMutedColor }]}>WillFit dashboard</ThemedText>
          </ThemedView>

          {DRAWER_ITEMS.map(item => {
            const Icon = item.icon;
            const itemHref = typeof item.href === 'string' ? item.href : undefined;
            const isActive = Boolean(itemHref && pathname === itemHref);

            return (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.78}
                style={styles.drawerItem}
                onPress={() => onPressItem(item)}>
                <Icon
                  size={22}
                  color={isActive ? '#FF8A00' : drawerTextColor}
                  strokeWidth={2.2}
                />
                <ThemedText
                  style={[
                    styles.drawerItemText,
                    { color: isActive ? '#FF8A00' : drawerTextColor },
                  ]}>
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}

          <ThemedView style={themePillStyle}>
            {THEME_OPTIONS.map(option => {
              const Icon = option.icon;
              const selected = themeOption === option.key;

              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.8}
                  style={[
                    styles.themeButton,
                    selected && {
                      backgroundColor: isDarkDrawer ? '#22272B' : '#FFFFFF',
                    },
                  ]}
                  onPress={() => setThemeOption(option.key)}>
                  <Icon
                    size={15}
                    color={selected ? drawerTextColor : drawerMutedColor}
                    strokeWidth={2.2}
                  />
                  <ThemedText
                    numberOfLines={1}
                    style={[
                      styles.themeButtonText,
                      { color: selected ? drawerTextColor : drawerMutedColor },
                    ]}>
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ThemedView>

          <ThemedView
            position='absolute'
            right={30}
            bottom={insets.bottom + 12}
            rowCenter
            gap={6}
            backgroundColor='transparent'>
            <Bell size={13} color={drawerMutedColor} />
            <ThemedText style={[styles.versionText, { color: drawerMutedColor }]}>v1.0.0</ThemedText>
          </ThemedView>
        </ThemedView>

        <Animated.View style={animatedContentStyle}>
          <Fragment>{children}</Fragment>
          <Animated.View style={animatedOverlayStyle}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
          </Animated.View>
        </Animated.View>
      </ThemedView>
    </AppDrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  drawerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0,
  },
  drawerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    marginTop: 20,
    padding: 4,
    width: 180,
  },
  themeButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 4,
  },
  themeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0,
  },
  versionText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
});
