import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedText } from 'components/themed-text';

import { useThemeColor } from 'hooks/use-theme-color';

const CHIPS = [
  { id: 'steps', label: 'Your Steps' },
  { id: 'heart', label: 'Heart Rate' },
  { id: 'sleep', label: 'Time Sleep' },
];

export function MetricChips() {
  const [activeId, setActiveId] = React.useState('steps');
  const activeBg = useThemeColor({}, 'accent');
  const activeText = useThemeColor({ light: '#FFF', dark: '#000' }, 'background');
  const inactiveText = useThemeColor({}, 'secondary');

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {CHIPS.map((chip) => {
          const isActive = activeId === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[
                styles.chip, 
                isActive && { backgroundColor: activeBg }
              ]}
              onPress={() => setActiveId(chip.id)}
            >
              <ThemedText style={[
                styles.label, 
                { color: isActive ? activeText : inactiveText }
              ]}>
                {chip.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
