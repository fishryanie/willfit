import { create } from 'zustand';

interface WorkoutState {
  isRecording: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  liveCoordinates: Coordinate[];
  recordingTitle: string;

  startWorkout: (title: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  stopWorkout: () => void;
  addCoordinate: (coord: Coordinate) => void;
  tick: () => void;
  resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  isRecording: false,
  isPaused: false,
  elapsedSeconds: 0,
  liveCoordinates: [],
  recordingTitle: 'Free run',

  startWorkout: title =>
    set({
      isRecording: true,
      isPaused: false,
      elapsedSeconds: 0,
      liveCoordinates: [],
      recordingTitle: title,
    }),

  pauseWorkout: () => set({ isPaused: true }),

  resumeWorkout: () => set({ isPaused: false }),

  stopWorkout: () => set({ isRecording: false, isPaused: false }),

  addCoordinate: coord => {
    const { isRecording, isPaused, liveCoordinates } = get();
    if (!isRecording || isPaused) return;

    // Avoid duplicate points if they are too close
    const lastCoord = liveCoordinates[liveCoordinates.length - 1];
    if (lastCoord && lastCoord.latitude === coord.latitude && lastCoord.longitude === coord.longitude) {
      return;
    }

    set({ liveCoordinates: [...liveCoordinates, coord] });
  },

  tick: () => {
    const { isRecording, isPaused } = get();
    if (isRecording && !isPaused) {
      set(state => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
    }
  },

  resetWorkout: () =>
    set({
      isRecording: false,
      isPaused: false,
      elapsedSeconds: 0,
      liveCoordinates: [],
      recordingTitle: 'Free run',
    }),
}));
