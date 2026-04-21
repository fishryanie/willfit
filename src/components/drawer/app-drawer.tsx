import { usePathname, useRouter, type Href } from 'expo-router';
import { Bell, CircleUserRound, LogOut, Settings, type LucideIcon } from 'lucide-react-native';
import { createContext, Fragment, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { type GestureResponderEvent, Pressable, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { ThemedText, ThemedView } from 'components/base';
import { useTheme } from 'store/use-theme-store';
import { ThemeToggle } from 'components/ui/organisms/theme-switch';

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
        <ThemedView absoluteFillObject safePaddingTop={96} paddingHorizontal={30} maxWidth={210} backgroundColor={drawerBackgroundColor}>
          <ThemedView
            gap={6}
            marginBottom={12}
            paddingBottom={14}
            borderBottomWidth={StyleSheet.hairlineWidth}
            borderBottomColor={isDarkDrawer ? 'rgba(255,255,255,0.18)' : 'rgba(36,41,74,0.14)'}
            backgroundColor='transparent'>
            <ThemedText color={drawerTextColor} fontSize={22} fontWeight='700' letterSpacing={0}>
              Sofia
            </ThemedText>
            <ThemedText color={drawerMutedColor} fontSize={12} lineHeight={16} letterSpacing={0}>
              WillFit dashboard
            </ThemedText>
          </ThemedView>

          {DRAWER_ITEMS.map(item => {
            const Icon = item.icon;
            const itemHref = typeof item.href === 'string' ? item.href : undefined;
            const isActive = Boolean(itemHref && pathname === itemHref);

            return (
              <TouchableOpacity key={item.name} activeOpacity={0.78} style={styles.drawerItem} onPress={() => onPressItem(item)}>
                <Icon size={22} color={isActive ? '#FF8A00' : drawerTextColor} strokeWidth={2.2} />
                <ThemedText color={isActive ? '#FF8A00' : drawerTextColor} fontSize={16} fontWeight='700' letterSpacing={0}>
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            );
          })}

          <ThemeToggle style={{ marginTop: 20 }} />

          <ThemedView position='absolute' right={30} safeBottom={12} rowCenter gap={6} backgroundColor='transparent'>
            <Bell size={13} color={drawerMutedColor} />
            <ThemedText color={drawerMutedColor} fontSize={12} lineHeight={16} letterSpacing={0}>
              v1.0.0
            </ThemedText>
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
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
});
