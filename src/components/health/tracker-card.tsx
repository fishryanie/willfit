import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { CircularProgress } from 'components/ui/organisms/circular-progress';
import { RollingCounter } from 'components/ui/organisms/rolling-counter';
import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { useHealthTracker } from 'hooks/use-health-tracker';
import { ChartColumnIncreasing, Footprints, Map } from 'lucide-react-native';

const STEP_GOAL = 10000;

export function HealthTrackerCard() {
  const { stepsAnimated, distanceAnimated, steps, distance, isPermissionsGranted } = useHealthTracker();
  const colorScheme = useColorScheme();
  
  const progress = useDerivedValue(() => {
    return (stepsAnimated.value / STEP_GOAL) * 100;
  });

  const distanceKm = (distance / 1000).toFixed(2);

  if (!isPermissionsGranted) {
    return (
      <ThemedView padding={16} radius={24} marginVertical={12}>
        <ThemedText>Vui lòng cấp quyền để theo dõi sức khỏe.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      padding={16}
      radius={24}
      marginVertical={12}
      borderWidth={StyleSheet.hairlineWidth}
      borderColor="rgba(150, 150, 150, 0.2)"
      style={styles.card}
    >
      <View style={styles.header}>
        <ThemedText type="subtitle">Hôm nay</ThemedText>
        <ChartColumnIncreasing size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.progressContainer}>
          <CircularProgress
            progress={progress}
            size={200}
            strokeWidth={15}
            progressCircleColor="#4CAF50"
            outerCircleColor={colorScheme === 'dark' ? '#333' : '#eee'}
            backgroundColor="transparent"
            renderIcon={() => (
              <View style={styles.counterWrapper}>
                <RollingCounter
                  value={stepsAnimated}
                  fontSize={32}
                  height={40}
                  width={22}
                  color={colorScheme === 'dark' ? '#fff' : '#000'}
                />
                <ThemedText style={styles.goalText}>/ {STEP_GOAL}</ThemedText>
              </View>
            )}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Footprints size={24} color="#4CAF50" />
            <ThemedText type="defaultSemiBold">Bước chân</ThemedText>
            <ThemedText>{steps}</ThemedText>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Map size={24} color="#2196F3" />
            <ThemedText type="defaultSemiBold">Quãng đường</ThemedText>
            <ThemedText>{distanceKm} km</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainContent: {
    alignItems: 'center',
  },
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
});
