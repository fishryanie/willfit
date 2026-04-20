import {
  Check,
  Dumbbell,
  Ellipsis,
  Plus,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from 'components/themed-text';
import { appToast } from 'lib/app-toast';

type WorkoutSet = {
  id: string;
  previous: string;
  weight: string;
  reps: string;
  done: boolean;
};

type WorkoutExercise = {
  id: string;
  title: string;
  tags: { label: string; tone: 'green' | 'blue' }[];
  sets: WorkoutSet[];
};

type WorkoutEntrySheetProps = {
  visible: boolean;
  onClose: () => void;
};

const INITIAL_EXERCISES: WorkoutExercise[] = [
  {
    id: 'chest-press',
    title: 'Chest Press (Machine)',
    tags: [{ label: 'Increased Difficulty', tone: 'green' }],
    sets: [
      { id: 'chest-1', previous: '90 lbs x 10', weight: '100', reps: '10', done: true },
      { id: 'chest-2', previous: '90 lbs x 12', weight: '100', reps: '10', done: true },
      { id: 'chest-3', previous: '90 lbs x 12', weight: '100', reps: '10', done: true },
      { id: 'chest-4', previous: '90 lbs x 12', weight: '100', reps: '10', done: true },
    ],
  },
  {
    id: 'kickback',
    title: 'Kickback (Dumbbell)',
    tags: [
      { label: 'New', tone: 'blue' },
      { label: 'Increased Difficulty', tone: 'green' },
    ],
    sets: [{ id: 'kickback-1', previous: '30 lbs x 12', weight: '35', reps: '10', done: false }],
  },
];

export function WorkoutEntrySheet({ visible, onClose }: WorkoutEntrySheetProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.min(height - insets.top - 18, 760);
  const translateY = useSharedValue(sheetHeight);
  const [elapsedSeconds, setElapsedSeconds] = useState(79);
  const [exercises, setExercises] = useState(INITIAL_EXERCISES);

  const completedSets = useMemo(
    () => exercises.reduce((count, exercise) => count + exercise.sets.filter(set => set.done).length, 0),
    [exercises],
  );
  const totalSets = useMemo(
    () => exercises.reduce((count, exercise) => count + exercise.sets.length, 0),
    [exercises],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    translateY.set(sheetHeight);
    translateY.set(
      withSpring(0, {
        damping: 24,
        stiffness: 170,
      }),
    );
  }, [sheetHeight, translateY, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds(value => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight,
    transform: [{ translateY: translateY.value }],
  }));

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setExercises(current =>
      current.map(exercise => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map(set => (set.id === setId ? { ...set, [field]: value } : set)),
        };
      }),
    );
  };

  const toggleSet = (exerciseId: string, setId: string) => {
    setExercises(current =>
      current.map(exercise => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map(set => (set.id === setId ? { ...set, done: !set.done } : set)),
        };
      }),
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises(current =>
      current.map(exercise => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const lastSet = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: `${exercise.id}-${Date.now()}`,
              previous: lastSet ? `${lastSet.weight} lbs x ${lastSet.reps}` : '--',
              weight: lastSet?.weight ?? '',
              reps: lastSet?.reps ?? '',
              done: false,
            },
          ],
          title: exercise.title,
        };
      }),
    );
  };

  const addExercise = () => {
    setExercises(current => [
      ...current,
      {
        id: `exercise-${Date.now()}`,
        title: 'Cable Fly',
        tags: [{ label: 'New', tone: 'blue' }],
        sets: [
          {
            id: `exercise-set-${Date.now()}`,
            previous: '--',
            weight: '',
            reps: '10',
            done: false,
          },
        ],
      },
    ]);
  };

  const finishWorkout = () => {
    appToast.success('Đã lưu bài tập', `${completedSets}/${totalSets} set đã hoàn tất.`);
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType='none'
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.portal}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.progressRing}>
              <View style={[styles.progressArc, { transform: [{ rotate: `${Math.min(completedSets * 36, 300)}deg` }] }]} />
            </View>
            <ThemedText style={styles.timer}>{formatDuration(elapsedSeconds)}</ThemedText>
            <TouchableOpacity activeOpacity={0.85} style={styles.finishButton} onPress={finishWorkout}>
              <ThemedText style={styles.finishText}>Finish</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}>
            <View style={styles.titleRow}>
              <View>
                <ThemedText style={styles.workoutTitle}>Push Day - Chest & Triceps</ThemedText>
                <ThemedText style={styles.workoutMeta}>
                  {completedSets}/{totalSets} sets complete
                </ThemedText>
              </View>
              <TouchableOpacity activeOpacity={0.8} style={styles.moreButton}>
                <Ellipsis size={22} color='#C8CAD2' />
              </TouchableOpacity>
            </View>

            {exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseBlock}>
                <View style={styles.exerciseHeader}>
                  <ExerciseThumb variant={index} />
                  <View style={styles.exerciseInfo}>
                    <ThemedText style={styles.exerciseTitle}>{exercise.title}</ThemedText>
                    <View style={styles.tagRow}>
                      {exercise.tags.map(tag => (
                        <View key={tag.label} style={[styles.tag, tag.tone === 'blue' && styles.tagBlue]}>
                          {tag.tone === 'blue' ? (
                            <Sparkles size={12} color='#7AA2FF' />
                          ) : (
                            <TrendingUp size={12} color='#4BD783' />
                          )}
                          <ThemedText style={[styles.tagText, tag.tone === 'blue' && styles.tagTextBlue]}>
                            {tag.label}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity activeOpacity={0.8} style={styles.moreButton}>
                    <Ellipsis size={22} color='#C8CAD2' />
                  </TouchableOpacity>
                </View>

                <SetTable
                  exercise={exercise}
                  onUpdateSet={updateSet}
                  onToggleSet={toggleSet}
                />

                <TouchableOpacity activeOpacity={0.84} style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
                  <Plus size={18} color='#E5E7EF' />
                  <ThemedText style={styles.addSetText}>Add Set</ThemedText>
                </TouchableOpacity>

                {index === 0 && (
                  <View style={styles.estimateCard}>
                    <TrendingUp size={22} color='#43D681' />
                    <ThemedText style={styles.estimateText}>
                      Estimated one rep max is 145 lbs which is a 7% increase from last time
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity activeOpacity={0.86} style={styles.addExerciseButton} onPress={addExercise}>
              <Plus size={19} color='#FFFFFF' />
              <ThemedText style={styles.addExerciseText}>Add Exercise</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SetTable({
  exercise,
  onUpdateSet,
  onToggleSet,
}: {
  exercise: WorkoutExercise;
  onUpdateSet: (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
  onToggleSet: (exerciseId: string, setId: string) => void;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <ThemedText style={[styles.tableLabel, styles.setColumn]}>Set</ThemedText>
        <ThemedText style={[styles.tableLabel, styles.previousColumn]}>Previous</ThemedText>
        <ThemedText style={[styles.tableLabel, styles.inputColumn]}>lbs</ThemedText>
        <ThemedText style={[styles.tableLabel, styles.inputColumn]}>Reps</ThemedText>
        <ThemedText style={[styles.tableLabel, styles.checkColumn]}>✓</ThemedText>
      </View>

      {exercise.sets.map((set, index) => (
        <View key={set.id} style={styles.setRow}>
          <ThemedText style={[styles.setNumber, styles.setColumn]}>{index + 1}</ThemedText>
          <ThemedText numberOfLines={1} style={[styles.previousText, styles.previousColumn]}>
            {set.previous}
          </ThemedText>
          <TextInput
            value={set.weight}
            onChangeText={value => onUpdateSet(exercise.id, set.id, 'weight', value)}
            keyboardType='number-pad'
            placeholder='--'
            placeholderTextColor='#6D707A'
            style={[styles.valueInput, styles.inputColumn]}
          />
          <TextInput
            value={set.reps}
            onChangeText={value => onUpdateSet(exercise.id, set.id, 'reps', value)}
            keyboardType='number-pad'
            placeholder='--'
            placeholderTextColor='#6D707A'
            style={[styles.valueInput, styles.inputColumn]}
          />
          <TouchableOpacity
            activeOpacity={0.84}
            style={[styles.checkButton, set.done && styles.checkButtonDone]}
            onPress={() => onToggleSet(exercise.id, set.id)}>
            {set.done ? <Check size={21} color='#FFFFFF' /> : <X size={18} color='#2A2C34' />}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function ExerciseThumb({ variant }: { variant: number }) {
  return (
    <View style={styles.thumb}>
      <View style={styles.thumbBench} />
      <View style={[styles.thumbBody, variant % 2 === 1 && styles.thumbBodyAlt]} />
      <Dumbbell size={20} color='#D8DAE2' />
    </View>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  portal: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.44)',
  },
  sheet: {
    marginHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#1C1D25',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.34,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 20,
    elevation: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 52,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6C6E78',
    marginTop: 8,
    marginBottom: 12,
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 8,
    borderColor: '#2D303A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressArc: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 8,
    borderLeftColor: '#536DFF',
    borderTopColor: '#536DFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timer: {
    color: '#F0F1F6',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: 0,
  },
  finishButton: {
    minWidth: 124,
    height: 62,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5BD67D',
  },
  finishText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 26,
  },
  workoutTitle: {
    color: '#ECEEF4',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: 0,
  },
  workoutMeta: {
    marginTop: 7,
    color: '#888C98',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  moreButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseBlock: {
    marginBottom: 30,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 17,
  },
  thumb: {
    width: 86,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#15161D',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbBench: {
    position: 'absolute',
    width: 54,
    height: 7,
    left: 16,
    bottom: 17,
    borderRadius: 4,
    backgroundColor: '#DEE2EB',
  },
  thumbBody: {
    position: 'absolute',
    width: 42,
    height: 24,
    left: 23,
    bottom: 24,
    borderRadius: 8,
    backgroundColor: '#949AA8',
    transform: [{ rotate: '-18deg' }],
  },
  thumbBodyAlt: {
    width: 46,
    height: 20,
    left: 18,
    transform: [{ rotate: '15deg' }],
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    color: '#F1F3F8',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 11,
  },
  tag: {
    minHeight: 30,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(54, 211, 153, 0.18)',
  },
  tagBlue: {
    backgroundColor: 'rgba(92, 117, 255, 0.18)',
  },
  tagText: {
    color: '#53D58A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tagTextBlue: {
    color: '#7AA2FF',
  },
  table: {
    gap: 11,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableLabel: {
    color: '#E7E9F0',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 62,
  },
  setColumn: {
    width: 46,
    textAlign: 'center',
  },
  previousColumn: {
    flex: 1,
    minWidth: 86,
  },
  inputColumn: {
    width: 66,
    textAlign: 'center',
  },
  checkColumn: {
    width: 44,
    textAlign: 'center',
  },
  setNumber: {
    color: '#EAECF2',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  previousText: {
    color: '#ECEEF4',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0,
  },
  valueInput: {
    minHeight: 45,
    borderRadius: 8,
    backgroundColor: '#252732',
    color: '#F0F1F6',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    paddingHorizontal: 6,
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#242630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDone: {
    backgroundColor: '#59D779',
  },
  addSetButton: {
    minHeight: 58,
    borderRadius: 8,
    marginTop: 20,
    backgroundColor: '#272A34',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addSetText: {
    color: '#E9EBF2',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  estimateCard: {
    marginTop: 19,
    borderRadius: 8,
    padding: 18,
    minHeight: 98,
    backgroundColor: '#232631',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  estimateText: {
    flex: 1,
    color: '#F0F1F7',
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    letterSpacing: 0,
  },
  addExerciseButton: {
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: '#3F66FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addExerciseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
