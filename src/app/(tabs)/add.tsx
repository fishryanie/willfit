import { useFocusEffect } from '@react-navigation/native';
import { Clock3, Dumbbell, Flame, Plus, Trophy, type LucideIcon } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { WorkoutEntrySheet } from 'components/workout/workout-entry-sheet';

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSheetVisible(true);
    }, []),
  );

  return (
    <ThemedView flex backgroundColor='#101114'>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 22,
            paddingBottom: insets.bottom + 120,
          },
        ]}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Dumbbell size={25} color='#FFFFFF' />
          </View>
          <View>
            <ThemedText style={styles.kicker}>Exercise</ThemedText>
            <ThemedText style={styles.title}>Log strength work</ThemedText>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.86} style={styles.primaryButton} onPress={() => setSheetVisible(true)}>
          <Plus size={22} color='#FFFFFF' />
          <ThemedText style={styles.primaryButtonText}>Add Exercise</ThemedText>
        </TouchableOpacity>

        <View style={styles.planCard}>
          <View>
            <ThemedText style={styles.planTitle}>Push Day</ThemedText>
            <ThemedText style={styles.planMeta}>Chest, triceps, machine press, dumbbell kickback</ThemedText>
          </View>
          <Flame size={28} color='#FF5A1F' />
        </View>

        <View style={styles.metricRow}>
          <MetricTile icon={Clock3} label='Timer' value='01:19' />
          <MetricTile icon={Trophy} label='Target' value='5 sets' />
        </View>

        <View style={styles.tipCard}>
          <ThemedText style={styles.tipTitle}>Ready to track</ThemedText>
          <ThemedText style={styles.tipText}>
            Open the sheet to enter lbs, reps, completed sets, and one rep max progress.
          </ThemedText>
        </View>
      </ScrollView>

      <WorkoutEntrySheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </ThemedView>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricTile}>
      <Icon size={18} color='#5BD67D' />
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#FF5A1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    color: '#8E939E',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  title: {
    marginTop: 3,
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: '#5BD67D',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  planCard: {
    minHeight: 112,
    borderRadius: 8,
    backgroundColor: '#1C1D25',
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  planMeta: {
    marginTop: 7,
    color: '#A4A8B4',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricTile: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#1C1D25',
    padding: 16,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: 0,
  },
  metricLabel: {
    color: '#8E939E',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
    letterSpacing: 0,
  },
  tipCard: {
    borderRadius: 8,
    backgroundColor: '#232631',
    padding: 18,
  },
  tipTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tipText: {
    marginTop: 7,
    color: '#C7CBD4',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
