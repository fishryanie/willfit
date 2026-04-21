import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText, ThemedView } from 'components/base';

import { useThemeColor } from 'store/use-theme-store';

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
    <ThemedView backgroundColor='transparent' marginBottom={24}>
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
              <ThemedText color={isActive ? activeText : inactiveText} fontSize={15} fontWeight='600' letterSpacing={0}>
                {chip.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
});
