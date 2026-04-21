import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, type GestureResponderEvent } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { ThemedText, ThemedView } from 'components/base';
import { useTheme } from 'store/use-theme-store';
import { AnimationType, EasingType } from 'constants/theme';

interface ThemeToggleProps {
  showLabel?: boolean;
  style?: any;
}

export const ThemeToggle = ({ showLabel = true, style }: ThemeToggleProps) => {
  const { isDark, toggleTheme } = useTheme();

  const colors = useMemo(() => {
    const isDarkTheme = isDark;
    return {
      background: isDarkTheme ? 'rgba(0,0,0,0.22)' : '#F0F0F0',
      iconBg: isDarkTheme ? '#22272B' : '#FFFFFF',
      text: isDarkTheme ? '#FFFFFF' : '#24294A',
      muted: isDarkTheme ? 'rgba(255,255,255,0.6)' : '#808080',
      track: isDarkTheme ? '#FF8A00' : '#D7D9DF',
      thumb: isDarkTheme ? '#24294A' : '#FFFFFF',
    };
  }, [isDark]);

  const handlePress = (event: GestureResponderEvent) => {
    void toggleTheme({
      touchX: event.nativeEvent.pageX,
      touchY: event.nativeEvent.pageY,
      animationType: AnimationType.Circular,
      animationDuration: 650,
      easing: EasingType.EaseInOut,
    });
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.86} 
      style={[styles.themePill, { backgroundColor: colors.background }, style]} 
      onPress={handlePress}
    >
      <ThemedView width={38} height={38} radius={8} alignItems='center' justifyContent='center' backgroundColor={colors.iconBg}>
        {isDark ? <Moon size={18} color='#FF8A00' /> : <Sun size={18} color='#FF8A00' />}
      </ThemedView>
      
      {showLabel && (
        <ThemedView backgroundColor='transparent' flex={1} minWidth={0}>
          <ThemedText color={colors.text} fontSize={13} fontWeight='800' letterSpacing={0}>
            {isDark ? 'Dark mode' : 'Light mode'}
          </ThemedText>
          <ThemedText color={colors.muted} fontSize={11} lineHeight={15} marginTop={2} fontWeight='700' letterSpacing={0}>
            Tap to switch
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView width={34} height={20} radius={8} padding={3} justifyContent='center' backgroundColor={colors.track}>
        <ThemedView width={14} height={14} radius={7} alignSelf={isDark ? 'flex-end' : undefined} backgroundColor={colors.thumb} />
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    width: 180,
    gap: 10,
  },
});
