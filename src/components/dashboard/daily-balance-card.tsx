import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { CircularProgress } from '../ui/organisms/circular-progress';
import { useSharedValue } from 'react-native-reanimated';
import { Flame, Utensils, Zap } from 'lucide-react-native';
import { useThemeColor } from 'hooks/use-theme-color';

export function DailyBalanceCard() {
  const progress = useSharedValue(65);
  const cardBg = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBg }]}>
      <ThemedView backgroundColor='transparent' marginBottom={20}>
        <ThemedText fontSize={18} fontWeight='600'>
          Your daily balance
        </ThemedText>
        <ThemedText fontSize={14} opacity={0.6} marginTop={4}>
          Goal - Food + Exercise
        </ThemedText>
      </ThemedView>

      <ThemedView backgroundColor='transparent' row justifyContent='space-between' alignItems='center'>
        <ThemedView backgroundColor='transparent' gap={16}>
          <ThemedView backgroundColor='transparent' row alignItems='center' gap={12}>
            <ThemedView square={32} radius={16} backgroundColor='rgba(255, 69, 58, 0.1)' contentCenter>
              <Flame size={16} color="#FF453A" />
            </ThemedView>
            <ThemedView backgroundColor='transparent'>
              <ThemedText fontSize={13} opacity={0.6}>Goals</ThemedText>
              <ThemedText fontSize={16} fontWeight='600'>1,670</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView backgroundColor='transparent' row alignItems='center' gap={12}>
            <ThemedView square={32} radius={16} backgroundColor='rgba(10, 132, 255, 0.1)' contentCenter>
              <Utensils size={16} color="#0A84FF" />
            </ThemedView>
            <ThemedView backgroundColor='transparent'>
              <ThemedText fontSize={13} opacity={0.6}>Food</ThemedText>
              <ThemedText fontSize={16} fontWeight='600'>300</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView backgroundColor='transparent' row alignItems='center' gap={12}>
            <ThemedView square={32} radius={16} backgroundColor='rgba(255, 159, 10, 0.1)' contentCenter>
              <Zap size={16} color="#FF9F0A" />
            </ThemedView>
            <ThemedView backgroundColor='transparent'>
              <ThemedText fontSize={13} opacity={0.6}>Exercise</ThemedText>
              <ThemedText fontSize={16} fontWeight='600'>0</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView backgroundColor='transparent' contentCenter>
          <CircularProgress
            progress={progress}
            size={140}
            strokeWidth={12}
            progressCircleColor={accentColor}
            outerCircleColor={secondaryColor + '33'}
            backgroundColor="transparent"
            renderIcon={() => (
              <ThemedView backgroundColor='transparent' alignItems='center'>
                <ThemedText fontSize={20} fontWeight='500'>1,670</ThemedText>
                <ThemedText fontSize={12} opacity={0.6} marginTop={2}>kcal</ThemedText>
              </ThemedView>
            )}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
