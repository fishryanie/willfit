import React from 'react';
import { StyleSheet, View, TouchableOpacity, useColorScheme } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BookOpen, House, Map, MessageCircle, Plus, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from 'components/themed-text';
import { useThemeColor } from 'hooks/use-theme-color';

const TAB_ICONS: Record<string, LucideIcon> = {
  index: House,
  workout: Map,
  add: Plus,
  explore: BookOpen,
  chat: MessageCircle,
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const cardBg = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, 'accent');

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom + 10 }]}>
      <View style={[styles.container, { backgroundColor: cardBg }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const label = options.title ?? route.name;
          const Icon = TAB_ICONS[route.name] ?? House;

          const activeItemContentColor = colorScheme === 'dark' ? '#000' : '#FFF';

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={[styles.tabItem, isFocused && { backgroundColor: accentColor }]}>
              <Icon size={22} color={isFocused ? activeItemContentColor : '#8E8E93'} />
              {isFocused && <ThemedText style={[styles.activeLabel, { color: activeItemContentColor }]}>{label}</ThemedText>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    gap: 8,
  },
  activeLabel: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
