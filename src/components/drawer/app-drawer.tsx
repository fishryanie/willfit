import { usePathname, useRouter, type Href } from 'expo-router';
import { Bell, CircleUserRound, LogOut, Moon, Settings, Sun, type LucideIcon } from 'lucide-react-native';
import { createContext, Fragment, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { type GestureResponderEvent, Pressable, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { useTheme } from 'components/ui/organisms/theme-switch/hooks';
import { AnimationType, EasingType } from 'components/ui/organisms/theme-switch/types';

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

const AppDrawerContext = createContext<DrawerContextValue | undefined>(undefined);

export function useAppDrawer() {
  const context = useContext(AppDrawerContext);

  if (!context) {
    console.warn('useAppDrawer must be used inside AppDrawerProvider. Returning dummy functions.');
    return {
      openDrawer: () => {},
      closeDrawer: () => {},
    };
  }

  return context;
}

export function AppDrawerProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);

  const isDarkDrawer = isDark;
  const drawerBackgroundColor = isDarkDrawer ? '#24294A' : '#FFFFFF';
  const drawerTextColor = isDarkDrawer ? '#FFFFFF' : '#24294A';
  const drawerMutedColor = isDarkDrawer ? 'rgba(255,255,255,0.6)' : '#808080';

  const progress = useDerivedValue(() => withTiming(isOpen ? 1 : 0), [isOpen]);

  const animatedContentStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(progress.value, [0, 1], [0, -15], Extrapolation.CLAMP);
    const borderRadius = interpolate(progress.value, [0, 1], [0, 28], Extrapolation.CLAMP);
    const scale = interpolate(progress.value, [0, 1], [1, 0.7], Extrapolation.CLAMP);
    const translateX = interpolate(progress.value, [0, 1], [0, width * 0.78], Extrapolation.CLAMP);

    return {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: '#1D2733',
      borderRadius,
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }, { scale }, { translateX }],
    };
  });

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    display: progress.value > 0.01 ? 'flex' : 'none',
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

  const onThemeSwitchPress = useCallback(
    (event: GestureResponderEvent) => {
      void toggleTheme({
        touchX: event.nativeEvent.pageX,
        touchY: event.nativeEvent.pageY,
        animationType: AnimationType.Circular,
        animationDuration: 650,
        easing: EasingType.EaseInOut,
      });
    },
    [toggleTheme],
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
        <ThemedView absoluteFillObject paddingTop={insets.top + 96} paddingHorizontal={30} maxWidth={210} backgroundColor={drawerBackgroundColor}>
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
              <TouchableOpacity key={item.name} activeOpacity={0.78} style={styles.drawerItem} onPress={() => onPressItem(item)}>
                <Icon size={22} color={isActive ? '#FF8A00' : drawerTextColor} strokeWidth={2.2} />
                <ThemedText style={[styles.drawerItemText, { color: isActive ? '#FF8A00' : drawerTextColor }]}>{item.name}</ThemedText>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity activeOpacity={0.86} style={themePillStyle} onPress={onThemeSwitchPress}>
            <ThemedView style={[styles.themeSwitchIcon, { backgroundColor: isDarkDrawer ? '#22272B' : '#FFFFFF' }]}>
              {isDarkDrawer ? <Moon size={18} color='#FF8A00' /> : <Sun size={18} color='#FF8A00' />}
            </ThemedView>
            <ThemedView backgroundColor='transparent' style={styles.themeSwitchCopy}>
              <ThemedText style={[styles.themeSwitchTitle, { color: drawerTextColor }]}>{isDarkDrawer ? 'Dark mode' : 'Light mode'}</ThemedText>
              <ThemedText style={[styles.themeSwitchMeta, { color: drawerMutedColor }]}>Tap to switch</ThemedText>
            </ThemedView>
            <ThemedView backgroundColor='transparent' style={[styles.themeSwitchTrack, isDarkDrawer && styles.themeSwitchTrackActive]}>
              <ThemedView style={[styles.themeSwitchThumb, isDarkDrawer && styles.themeSwitchThumbActive]} />
            </ThemedView>
          </TouchableOpacity>

          <ThemedView position='absolute' right={30} bottom={insets.bottom + 12} rowCenter gap={6} backgroundColor='transparent'>
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
    borderRadius: 8,
    marginTop: 20,
    padding: 8,
    width: 180,
    gap: 10,
  },
  themeSwitchIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeSwitchCopy: {
    flex: 1,
    minWidth: 0,
  },
  themeSwitchTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  themeSwitchMeta: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    fontWeight: '700',
    letterSpacing: 0,
  },
  themeSwitchTrack: {
    width: 34,
    height: 20,
    borderRadius: 8,
    backgroundColor: '#D7D9DF',
    padding: 3,
    justifyContent: 'center',
  },
  themeSwitchTrackActive: {
    backgroundColor: '#FF8A00',
  },
  themeSwitchThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  themeSwitchThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#24294A',
  },
  versionText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
});
