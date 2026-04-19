import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from 'components/themed-text';
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
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Your daily balance</ThemedText>
        <ThemedText style={styles.subtitle}>Goal - Food + Exercise</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 69, 58, 0.1)' }]}>
              <Flame size={16} color="#FF453A" />
            </View>
            <View>
              <ThemedText style={styles.statLabel}>Goals</ThemedText>
              <ThemedText style={styles.statValue}>1,670</ThemedText>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(10, 132, 255, 0.1)' }]}>
              <Utensils size={16} color="#0A84FF" />
            </View>
            <View>
              <ThemedText style={styles.statLabel}>Food</ThemedText>
              <ThemedText style={styles.statValue}>300</ThemedText>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 159, 10, 0.1)' }]}>
              <Zap size={16} color="#FF9F0A" />
            </View>
            <View>
              <ThemedText style={styles.statLabel}>Exercise</ThemedText>
              <ThemedText style={styles.statValue}>0</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <CircularProgress
            progress={progress}
            size={140}
            strokeWidth={12}
            progressCircleColor={accentColor}
            outerCircleColor={secondaryColor + '33'}
            backgroundColor="transparent"
            renderIcon={() => (
              <View style={styles.innerValueContainer}>
                <ThemedText style={styles.innerValue}>1,670</ThemedText>
                <ThemedText style={styles.innerUnit}>kcal</ThemedText>
              </View>
            )}
          />
        </View>
      </View>
    </View>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerValueContainer: {
    alignItems: 'center',
  },
  innerValue: {
    fontSize: 20,
    fontWeight: '500',
  },
  innerUnit: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});
