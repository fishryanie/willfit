import { Heart } from 'lucide-react-native';
import { ThemedText } from 'components/themed-text';
import { useThemeColor } from 'hooks/use-theme-color';
import { StyleSheet, View } from 'react-native';

export function HeartRateCard() {
  const cardBg = useThemeColor({}, 'card');

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>Heart rate</ThemedText>
        </View>
        <Heart size={24} color="#FF453A" />
      </View>

      <View style={styles.content}>
        <View style={styles.graphContainer}>
            {/* Simple representation of a heart rate graph */}
            <View style={styles.graphPlaceholder}>
                <View style={styles.graphLine} />
                <View style={[styles.graphDot, { left: '60%', top: '40%' }]} />
            </View>
        </View>
        <View style={styles.stats}>
          <ThemedText style={styles.value}>120</ThemedText>
          <ThemedText style={styles.unit}>bpm</ThemedText>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  graphContainer: {
    flex: 1,
    height: 60,
    justifyContent: 'flex-end',
  },
  graphPlaceholder: {
    height: 40,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  graphLine: {
    height: 2,
    backgroundColor: 'rgba(255, 69, 58, 0.3)',
    width: '100%',
  },
  graphDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF453A',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stats: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
  },
  unit: {
    fontSize: 14,
    opacity: 0.6,
  },
});
