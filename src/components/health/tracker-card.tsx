import React from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { CircularProgress } from 'components/ui/organisms/circular-progress';
import { RollingCounter } from 'components/ui/organisms/rolling-counter';
import { ThemedText, ThemedView } from 'components/base';
import { useHealthTracker } from 'hooks/use-health-tracker';
import { useColorScheme } from 'hooks/use-color-scheme';
import { ChartColumnIncreasing, Footprints, Map } from 'lucide-react-native';

const STEP_GOAL = 10000;

export function HealthTrackerCard() {
  const { stepsAnimated, steps, distance, isPermissionsGranted } = useHealthTracker();
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
      <ThemedView backgroundColor='transparent' style={styles.header}>
        <ThemedText type="subtitle">Hôm nay</ThemedText>
        <ChartColumnIncreasing size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </ThemedView>

      <ThemedView backgroundColor='transparent' alignItems='center'>
        <ThemedView backgroundColor='transparent' marginVertical={20} contentCenter>
          <CircularProgress
            progress={progress}
            size={200}
            strokeWidth={15}
            progressCircleColor="#4CAF50"
            outerCircleColor={colorScheme === 'dark' ? '#333' : '#eee'}
            backgroundColor="transparent"
            renderIcon={() => (
              <ThemedView backgroundColor='transparent' contentCenter>
                <RollingCounter
                  value={stepsAnimated}
                  fontSize={32}
                  height={40}
                  width={22}
                  color={colorScheme === 'dark' ? '#fff' : '#000'}
                />
                <ThemedText fontSize={14} opacity={0.6} marginTop={4}>/ {STEP_GOAL}</ThemedText>
              </ThemedView>
            )}
          />
        </ThemedView>

        <ThemedView backgroundColor='transparent' style={styles.statsRow}>
          <ThemedView backgroundColor='transparent' alignItems='center' gap={4}>
            <Footprints size={24} color="#4CAF50" />
            <ThemedText type="defaultSemiBold">Bước chân</ThemedText>
            <ThemedText>{steps}</ThemedText>
          </ThemedView>
          
          <ThemedView width={1} height='100%' backgroundColor='rgba(150, 150, 150, 0.2)' />

          <ThemedView backgroundColor='transparent' alignItems='center' gap={4}>
            <Map size={24} color="#2196F3" />
            <ThemedText type="defaultSemiBold">Quãng đường</ThemedText>
            <ThemedText>{distanceKm} km</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
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
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
});
