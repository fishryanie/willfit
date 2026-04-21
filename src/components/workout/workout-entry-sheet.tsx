import { Check, Dumbbell, Ellipsis, Plus, Sparkles, TrendingUp, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText, ThemedView } from 'components/base';
import { appToast } from 'utils/app-toast';

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

  const completedSets = useMemo(() => exercises.reduce((count, exercise) => count + exercise.sets.filter(set => set.done).length, 0), [exercises]);
  const totalSets = useMemo(() => exercises.reduce((count, exercise) => count + exercise.sets.length, 0), [exercises]);

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
    <Modal animationType='none' transparent visible={visible} statusBarTranslucent onRequestClose={onClose}>
      <ThemedView backgroundColor='transparent' flex justifyContent='flex-end' zIndex={50}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <ThemedView alignSelf='center' width={52} height={6} radius={3} backgroundColor='#6C6E78' marginTop={8} marginBottom={12} />

          <ThemedView backgroundColor='transparent' minHeight={68} paddingHorizontal={24} row alignItems='center' justifyContent='space-between'>
            <ThemedView width={52} height={52} radius={26} borderWidth={8} borderColor='#2D303A' alignItems='center' justifyContent='center' overflow='hidden'>
              <ThemedView
                position='absolute'
                width={52}
                height={52}
                radius={26}
                borderWidth={8}
                borderLeftColor='#536DFF'
                borderTopColor='#536DFF'
                borderRightColor='transparent'
                borderBottomColor='transparent'
                transform={[{ rotate: `${Math.min(completedSets * 36, 300)}deg` }]}
              />
            </ThemedView>
            <ThemedText color='#F0F1F6' fontSize={25} lineHeight={30} fontWeight='900' letterSpacing={0}>
              {formatDuration(elapsedSeconds)}
            </ThemedText>
            <TouchableOpacity activeOpacity={0.85} style={styles.finishButton} onPress={finishWorkout}>
              <ThemedText color='#FFFFFF' fontSize={19} fontWeight='900' letterSpacing={0}>
                Finish
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}>
            <ThemedView backgroundColor='transparent' row alignItems='flex-start' justifyContent='space-between' gap={14} marginBottom={26}>
              <ThemedView backgroundColor='transparent'>
                <ThemedText color='#ECEEF4' fontSize={25} lineHeight={31} fontWeight='900' letterSpacing={0}>
                  Push Day - Chest & Triceps
                </ThemedText>
                <ThemedText color='#888C98' fontSize={13} fontWeight='800' letterSpacing={0} marginTop={7}>
                  {completedSets}/{totalSets} sets complete
                </ThemedText>
              </ThemedView>
              <TouchableOpacity activeOpacity={0.8} style={styles.moreButton}>
                <Ellipsis size={22} color='#C8CAD2' />
              </TouchableOpacity>
            </ThemedView>

            {exercises.map((exercise, index) => (
              <ThemedView key={exercise.id} backgroundColor='transparent' marginBottom={30}>
                <ThemedView backgroundColor='transparent' row alignItems='center' gap={14} marginBottom={17}>
                  <ExerciseThumb variant={index} />
                  <ThemedView backgroundColor='transparent' flex>
                    <ThemedText color='#F1F3F8' fontSize={20} lineHeight={25} fontWeight='900' letterSpacing={0}>
                      {exercise.title}
                    </ThemedText>
                    <ThemedView backgroundColor='transparent' row wrap gap={7} marginTop={11}>
                      {exercise.tags.map(tag => (
                        <ThemedView
                          key={tag.label}
                          minHeight={30}
                          radius={8}
                          paddingHorizontal={10}
                          row
                          alignItems='center'
                          gap={5}
                          backgroundColor={tag.tone === 'blue' ? 'rgba(92, 117, 255, 0.18)' : 'rgba(54, 211, 153, 0.18)'}>
                          {tag.tone === 'blue' ? <Sparkles size={12} color='#7AA2FF' /> : <TrendingUp size={12} color='#4BD783' />}
                          <ThemedText color={tag.tone === 'blue' ? '#7AA2FF' : '#53D58A'} fontSize={14} fontWeight='900' letterSpacing={0}>
                            {tag.label}
                          </ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </ThemedView>
                  <TouchableOpacity activeOpacity={0.8} style={styles.moreButton}>
                    <Ellipsis size={22} color='#C8CAD2' />
                  </TouchableOpacity>
                </ThemedView>

                <SetTable exercise={exercise} onUpdateSet={updateSet} onToggleSet={toggleSet} />

                <TouchableOpacity activeOpacity={0.84} style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
                  <Plus size={18} color='#E5E7EF' />
                  <ThemedText color='#E9EBF2' fontSize={22} fontWeight='900' letterSpacing={0}>
                    Add Set
                  </ThemedText>
                </TouchableOpacity>

                {index === 0 && (
                  <ThemedView marginTop={19} radius={8} padding={18} minHeight={98} backgroundColor='#232631' row alignItems='center' gap={16}>
                    <TrendingUp size={22} color='#43D681' />
                    <ThemedText flex color='#F0F1F7' fontSize={21} lineHeight={27} fontWeight='800' letterSpacing={0}>
                      Estimated one rep max is 145 lbs which is a 7% increase from last time
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            ))}

            <TouchableOpacity activeOpacity={0.86} style={styles.addExerciseButton} onPress={addExercise}>
              <Plus size={19} color='#FFFFFF' />
              <ThemedText color='#FFFFFF' fontSize={18} fontWeight='900' letterSpacing={0}>
                Add Exercise
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </ThemedView>
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
    <ThemedView backgroundColor='transparent' gap={11}>
      <ThemedView backgroundColor='transparent' row alignItems='center' gap={8}>
        <ThemedText width={46} textAlign='center' color='#E7E9F0' fontSize={22} lineHeight={28} fontWeight='900' letterSpacing={0}>
          Set
        </ThemedText>
        <ThemedText flex minWidth={86} color='#E7E9F0' fontSize={22} lineHeight={28} fontWeight='900' letterSpacing={0}>
          Previous
        </ThemedText>
        <ThemedText width={66} textAlign='center' color='#E7E9F0' fontSize={22} lineHeight={28} fontWeight='900' letterSpacing={0}>
          lbs
        </ThemedText>
        <ThemedText width={66} textAlign='center' color='#E7E9F0' fontSize={22} lineHeight={28} fontWeight='900' letterSpacing={0}>
          Reps
        </ThemedText>
        <ThemedText width={44} textAlign='center' color='#E7E9F0' fontSize={22} lineHeight={28} fontWeight='900' letterSpacing={0}>
          ✓
        </ThemedText>
      </ThemedView>

      {exercise.sets.map((set, index) => (
        <ThemedView key={set.id} backgroundColor='transparent' row alignItems='center' gap={8} minHeight={62}>
          <ThemedText width={46} textAlign='center' color='#EAECF2' fontSize={22} fontWeight='800' letterSpacing={0}>
            {index + 1}
          </ThemedText>
          <ThemedText numberOfLines={1} flex minWidth={86} color='#ECEEF4' fontSize={19} fontWeight='800' letterSpacing={0}>
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
        </ThemedView>
      ))}
    </ThemedView>
  );
}

function ExerciseThumb({ variant }: { variant: number }) {
  return (
    <ThemedView width={86} height={76} radius={8} backgroundColor='#15161D' alignItems='center' justifyContent='center' overflow='hidden'>
      <ThemedView position='absolute' width={54} height={7} left={16} bottom={17} radius={4} backgroundColor='#DEE2EB' />
      <ThemedView
        position='absolute'
        width={variant % 2 === 1 ? 46 : 42}
        height={variant % 2 === 1 ? 20 : 24}
        left={variant % 2 === 1 ? 18 : 23}
        bottom={24}
        radius={8}
        backgroundColor='#949AA8'
        transform={[{ rotate: variant % 2 === 1 ? '15deg' : '-18deg' }]}
      />
      <Dumbbell size={20} color='#D8DAE2' />
    </ThemedView>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
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
  finishButton: {
    minWidth: 124,
    height: 62,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5BD67D',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  moreButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputColumn: {
    width: 66,
    textAlign: 'center',
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
  addExerciseButton: {
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: '#3F66FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
