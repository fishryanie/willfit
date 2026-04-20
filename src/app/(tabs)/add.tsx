import { useFocusEffect } from '@react-navigation/native';
import { Clock3, Dumbbell, Flame, Plus, Trophy, type LucideIcon } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
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
        <ThemedView row alignItems='center' gap={13} backgroundColor='transparent'>
          <ThemedView square={54} radius={8} backgroundColor='#FF5A1F' contentCenter>
            <Dumbbell size={25} color='#FFFFFF' />
          </ThemedView>
          <ThemedView backgroundColor='transparent'>
            <ThemedText color='#8E939E' fontSize={13} fontWeight='900' letterSpacing={0}>
              Exercise
            </ThemedText>
            <ThemedText color='#FFFFFF' fontSize={29} lineHeight={34} fontWeight='900' letterSpacing={0} marginTop={3}>
              Log strength work
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity activeOpacity={0.86} style={styles.primaryButton} onPress={() => setSheetVisible(true)}>
          <Plus size={22} color='#FFFFFF' />
          <ThemedText color='#FFFFFF' fontSize={18} fontWeight='900' letterSpacing={0}>
            Add Exercise
          </ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.planCard}>
          <ThemedView backgroundColor='transparent'>
            <ThemedText color='#FFFFFF' fontSize={24} fontWeight='900' letterSpacing={0}>
              Push Day
            </ThemedText>
            <ThemedText color='#A4A8B4' fontSize={14} lineHeight={20} fontWeight='700' letterSpacing={0} marginTop={7}>
              Chest, triceps, machine press, dumbbell kickback
            </ThemedText>
          </ThemedView>
          <Flame size={28} color='#FF5A1F' />
        </ThemedView>

        <ThemedView row gap={12} backgroundColor='transparent'>
          <MetricTile icon={Clock3} label='Timer' value='01:19' />
          <MetricTile icon={Trophy} label='Target' value='5 sets' />
        </ThemedView>

        <ThemedView radius={8} backgroundColor='#232631' padding={18}>
          <ThemedText color='#FFFFFF' fontSize={18} fontWeight='900' letterSpacing={0}>
            Ready to track
          </ThemedText>
          <ThemedText color='#C7CBD4' fontSize={14} lineHeight={21} fontWeight='700' letterSpacing={0} marginTop={7}>
            Open the sheet to enter lbs, reps, completed sets, and one rep max progress.
          </ThemedText>
        </ThemedView>
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
    <ThemedView flex radius={8} backgroundColor='#1C1D25' padding={16}>
      <Icon size={18} color='#5BD67D' />
      <ThemedText color='#FFFFFF' fontSize={22} fontWeight='900' marginTop={10} letterSpacing={0}>
        {value}
      </ThemedText>
      <ThemedText color='#8E939E' fontSize={12} fontWeight='800' marginTop={3} letterSpacing={0}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    gap: 16,
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
});
