import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from 'components/themed-text';

import { useThemeColor } from 'hooks/use-theme-color';

export function WeightJourneyCard() {
  const cardBg = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, 'accent');
  const barBg = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: '#333' }, 'card');

  const data = [
    { label: 'Mon', value: 0.4 },
    { label: 'Tue', value: 0.6 },
    { label: 'Wed', value: 0.5 },
    { label: 'Thu', value: 0.7 },
    { label: 'Fri', value: 0.9, highlight: true },
    { label: 'Sat', value: 0.6 },
    { label: 'Sun', value: 0.4 },
    { label: 'Mon', value: 0.3 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Weight journey</ThemedText>
        <ThemedText style={styles.subtitle}>Last 30 days</ThemedText>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                { height: `${item.value * 100}%`, backgroundColor: item.highlight ? accentColor : barBg },
                item.highlight && styles.highlightedBar
              ]} 
            />
            {item.highlight && <ThemedText style={styles.barLabel}>{item.label}</ThemedText>}
          </View>
        ))}
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
    marginBottom: 24,
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
  chartContainer: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  highlightedBar: {
    width: 8,
  },
  barLabel: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 8,
    position: 'absolute',
    bottom: -20,
  },
});
