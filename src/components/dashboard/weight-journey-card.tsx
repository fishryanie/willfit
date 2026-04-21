import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText, ThemedView } from 'components/base';

import { useThemeColor } from 'hooks/use-theme-color';

export function WeightJourneyCard() {
  const cardBg = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, 'accent');
  const barBg = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: '#333' }, 'card');

  const data = [
    { id: 'mon-current', label: 'Mon', value: 0.4 },
    { id: 'tue-current', label: 'Tue', value: 0.6 },
    { id: 'wed-current', label: 'Wed', value: 0.5 },
    { id: 'thu-current', label: 'Thu', value: 0.7 },
    { id: 'fri-current', label: 'Fri', value: 0.9, highlight: true },
    { id: 'sat-current', label: 'Sat', value: 0.6 },
    { id: 'sun-current', label: 'Sun', value: 0.4 },
    { id: 'mon-previous', label: 'Mon', value: 0.3 },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBg }]}>
      <ThemedView backgroundColor='transparent' marginBottom={24}>
        <ThemedText fontSize={18} fontWeight='600'>Weight journey</ThemedText>
        <ThemedText fontSize={14} opacity={0.6} marginTop={4}>Last 30 days</ThemedText>
      </ThemedView>

      <ThemedView backgroundColor='transparent' row height={120} alignItems='flex-end' justifyContent='space-between'>
        {data.map(item => (
          <ThemedView key={item.id} backgroundColor='transparent' flex alignItems='center' height='100%' justifyContent='flex-end'>
            <ThemedView
              style={[
                styles.bar, 
                { height: `${item.value * 100}%`, backgroundColor: item.highlight ? accentColor : barBg },
                item.highlight && styles.highlightedBar
              ]} 
            />
            {item.highlight && (
              <ThemedText fontSize={10} opacity={0.6} marginTop={8} position='absolute' bottom={-20}>
                {item.label}
              </ThemedText>
            )}
          </ThemedView>
        ))}
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
  bar: {
    width: 6,
    borderRadius: 3,
  },
  highlightedBar: {
    width: 8,
  },
});
