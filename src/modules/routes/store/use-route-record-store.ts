import * as Location from 'expo-location';
import { useEffect } from 'react';
import type { MapType } from 'react-native-maps';
import { create } from 'zustand';
import { appToast } from 'utils/app-toast';
import { storage } from 'utils/storage';
import { AUTO_DISCARD_AFTER_MS, MIN_DISTANCE, ROUTE_STORAGE_KEY } from '../constants';
import { mapCenter, currentLocation } from '../mocks/map-coordinates';
import { startRouteLocationTracking, stopRouteLocationTracking } from '../services/route-location-tracking';
import type { SuggestedWalkingRoute } from '../types/suggested-route';
import { estimateCalories, formatLivePace } from '../utils';
import { calculateRouteDistanceKm } from '../utils/geo';

export type RouteRecordPhase = 'pre' | 'intra' | 'finish';

export type FinishedRecordSummary = {
  coordinates: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  averagePace: string;
  estimatedCalories: number;
  elevationGain: number;
  routeName: string;
};

type GpsVariant = 'good' | 'warning';

type RouteRecordState = {
  origin: { latitude: number; longitude: number };
  phase: RouteRecordPhase;
  gpsVariant: GpsVariant;
  isLocating: boolean;
  isThreeD: boolean;
  mapType: MapType;
  showsTraffic: boolean;
  showsBuildings: boolean;
  isMapLayerSheetOpen: boolean;
  focusSignal: number;
  savedRoutes: SuggestedWalkingRoute[];
  suggestions: SuggestedWalkingRoute[];
  selectedRoute: SuggestedWalkingRoute | undefined;
  finishedRecord: FinishedRecordSummary | null;

  isRecording: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  liveCoordinates: Coordinate[];
  recordingTitle: string;
  startedAt: number | null;
  pausedAt: number | null;
  pausedDurationMs: number;
  lastDistanceChangeAt: number | null;

  setOrigin: (origin: { latitude: number; longitude: number }) => void;
  setGpsVariant: (variant: GpsVariant) => void;
  setIsLocating: (value: boolean) => void;
  setSuggestions: (routes: SuggestedWalkingRoute[]) => void;
  hydrateSavedRoutes: (routes: SuggestedWalkingRoute[]) => void;
  hydrateSavedRoutesFromStorage: () => Promise<void>;
  setSelectedRoute: (route: SuggestedWalkingRoute | undefined) => void;
  setMapType: (mapType: MapType) => void;
  openMapLayerSheet: () => void;
  closeMapLayerSheet: () => void;
  toggleThreeD: () => void;
  toggleTraffic: () => void;
  toggleBuildings: () => void;
  bumpFocusSignal: () => void;
  resolveCurrentLocation: (options?: { forceFocus?: boolean }) => Promise<void>;
  openCreateRoute: () => void;

  startRoute: (route: SuggestedWalkingRoute) => Promise<void>;
  startSelectedRoute: () => Promise<void>;
  finishRecording: () => Promise<void>;
  discardRecording: () => Promise<void>;
  closeFinishRecord: () => void;
  saveFinishedRoute: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  startRecording: (title: string, startedAt?: number) => void;
  stopRecording: () => void;
  resetRecording: () => void;
  syncElapsedTime: (referenceTime?: number) => void;
  addLiveCoordinate: (coord: Coordinate, sampleTimestamp?: number) => boolean;
  shouldAutoDiscard: (referenceTime?: number) => boolean;
};

const MAX_SAVED_ROUTES = 6;

const distanceBetweenMeters = (from: Coordinate, to: Coordinate) => {
  const earthRadius = 6371000;
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const fromLatitude = (from.latitude * Math.PI) / 180;
  const toLatitude = (to.latitude * Math.PI) / 180;

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const mergeSuggestions = (savedRoutes: SuggestedWalkingRoute[], generatedRoutes: SuggestedWalkingRoute[]) => {
  const deduped = new Map<string, SuggestedWalkingRoute>();

  [...savedRoutes, ...generatedRoutes].forEach(route => {
    if (route.coordinates.length < 2) {
      return;
    }

    if (!deduped.has(route.id)) {
      deduped.set(route.id, route);
    }
  });

  return Array.from(deduped.values());
};

const getGeneratedRoutes = (routes: SuggestedWalkingRoute[]) => routes.filter(route => route.source !== 'recorded');

const resetRecordingState = {
  isRecording: false,
  isPaused: false,
  elapsedSeconds: 0,
  liveCoordinates: [],
  recordingTitle: 'Free run',
  startedAt: null,
  pausedAt: null,
  pausedDurationMs: 0,
  lastDistanceChangeAt: null,
} satisfies Pick<
  RouteRecordState,
  'isRecording' | 'isPaused' | 'elapsedSeconds' | 'liveCoordinates' | 'recordingTitle' | 'startedAt' | 'pausedAt' | 'pausedDurationMs' | 'lastDistanceChangeAt'
>;

export const useRouteRecordStore = create<RouteRecordState>((set, get) => ({
  origin: currentLocation,
  phase: 'pre',
  gpsVariant: 'warning',
  isLocating: true,
  isThreeD: false,
  mapType: 'standard',
  showsTraffic: false,
  showsBuildings: true,
  isMapLayerSheetOpen: false,
  focusSignal: 0,
  savedRoutes: [],
  suggestions: [],
  selectedRoute: undefined,
  finishedRecord: null,
  ...resetRecordingState,

  setOrigin: origin => set({ origin }),
  setGpsVariant: gpsVariant => set({ gpsVariant }),
  setIsLocating: isLocating => set({ isLocating }),
  setSuggestions: generatedRoutes => {
    const savedRoutes = get().savedRoutes;
    const previousSelectedRoute = get().selectedRoute;
    const suggestions = mergeSuggestions(savedRoutes, generatedRoutes);
    const preservedSelectedRoute = suggestions.find(route => route.id === previousSelectedRoute?.id);

    set({
      suggestions,
      selectedRoute: preservedSelectedRoute ?? suggestions[0],
    });
  },
  hydrateSavedRoutes: savedRoutes => {
    const normalizedSavedRoutes = savedRoutes
      .filter(route => route.coordinates.length > 1)
      .slice(0, MAX_SAVED_ROUTES)
      .map(route => ({ ...route, source: 'recorded' as const }));
    const generatedRoutes = getGeneratedRoutes(get().suggestions);
    const suggestions = mergeSuggestions(normalizedSavedRoutes, generatedRoutes);
    const previousSelectedRoute = get().selectedRoute;

    set({
      savedRoutes: normalizedSavedRoutes,
      suggestions,
      selectedRoute: suggestions.find(route => route.id === previousSelectedRoute?.id) ?? suggestions[0],
    });
  },
  hydrateSavedRoutesFromStorage: async () => {
    const value = await storage.getItem(ROUTE_STORAGE_KEY.SAVED_ROUTE_SUGGESTIONS);
    if (!value) {
      return;
    }

    try {
      get().hydrateSavedRoutes(JSON.parse(value) as SuggestedWalkingRoute[]);
    } catch (error) {
      console.error('Failed to parse saved route suggestions', error);
    }
  },
  setSelectedRoute: selectedRoute => set({ selectedRoute }),
  setMapType: mapType =>
    set(state => ({
      mapType,
      focusSignal: state.focusSignal + 1,
    })),
  openMapLayerSheet: () => set({ isMapLayerSheetOpen: true }),
  closeMapLayerSheet: () => set({ isMapLayerSheetOpen: false }),
  toggleThreeD: () =>
    set(state => ({
      isThreeD: !state.isThreeD,
      focusSignal: state.focusSignal + 1,
    })),
  toggleTraffic: () => set(state => ({ showsTraffic: !state.showsTraffic })),
  toggleBuildings: () => set(state => ({ showsBuildings: !state.showsBuildings })),
  bumpFocusSignal: () => set(state => ({ focusSignal: state.focusSignal + 1 })),
  resolveCurrentLocation: async (options?: { forceFocus?: boolean }) => {
    const forceFocus = options?.forceFocus ?? true;

    set({ isLocating: true });

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        set({ origin: mapCenter, gpsVariant: 'warning' });
        if (forceFocus) {
          get().bumpFocusSignal();
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      set({
        origin: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        gpsVariant: 'good',
      });
      if (forceFocus) {
        get().bumpFocusSignal();
      }
    } catch {
      set({ origin: mapCenter, gpsVariant: 'warning' });
      if (forceFocus) {
        get().bumpFocusSignal();
      }
    } finally {
      set({ isLocating: false });
    }
  },
  openCreateRoute: () => {
    appToast.info('Tạo lộ trình', 'Flow tạo lộ trình thủ công cũ đã được gỡ khỏi app.');
  },

  startRoute: async route => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      set({ gpsVariant: 'warning' });
      return;
    }

    await Location.requestBackgroundPermissionsAsync().catch(() => undefined);

    const startedAt = Date.now();
    set({
      selectedRoute: route,
      finishedRecord: null,
      phase: 'intra',
      isRecording: true,
      isPaused: false,
      elapsedSeconds: 0,
      liveCoordinates: [],
      recordingTitle: route.name,
      startedAt,
      pausedAt: null,
      pausedDurationMs: 0,
      lastDistanceChangeAt: startedAt,
    });

    get().syncElapsedTime(startedAt);
    await startRouteLocationTracking();
  },
  startSelectedRoute: async () => {
    const selectedRoute = get().selectedRoute;
    if (selectedRoute) {
      await get().startRoute(selectedRoute);
    }
  },
  finishRecording: async () => {
    get().syncElapsedTime();

    const state = get();
    const coordinates = state.liveCoordinates.length > 1 ? state.liveCoordinates : state.selectedRoute?.coordinates ?? [];
    const distanceMeters = Math.round(calculateRouteDistanceKm(coordinates) * 1000);
    const durationSeconds = state.elapsedSeconds;

    await stopRouteLocationTracking();

    set({
      ...resetRecordingState,
      finishedRecord: {
        coordinates,
        distanceMeters,
        durationSeconds,
        averagePace: formatLivePace(distanceMeters, durationSeconds),
        estimatedCalories: estimateCalories(distanceMeters),
        elevationGain: state.selectedRoute?.estimatedElevationGain ?? 0,
        routeName: state.selectedRoute?.name ?? 'Lộ trình của bạn',
      },
      phase: 'finish',
    });
  },
  discardRecording: async () => {
    await stopRouteLocationTracking();
    set({
      ...resetRecordingState,
      phase: 'pre',
      finishedRecord: null,
    });
  },
  closeFinishRecord: () =>
    set({
      phase: 'pre',
      finishedRecord: null,
    }),
  saveFinishedRoute: async () => {
    const finishedRecord = get().finishedRecord;
    if (!finishedRecord || finishedRecord.coordinates.length < 2) {
      appToast.warning('Chưa thể lưu lộ trình', 'Buổi chạy chưa có đủ dữ liệu để tạo lộ trình mới.');
      set({ phase: 'pre', finishedRecord: null });
      return;
    }

    const fallbackName =
      finishedRecord.routeName === 'Lộ trình của bạn'
        ? `Lộ trình đã lưu ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
        : finishedRecord.routeName;

    const savedRoute: SuggestedWalkingRoute = {
      id: `saved-route-${Date.now()}`,
      name: fallbackName,
      distanceKm: Number((finishedRecord.distanceMeters / 1000).toFixed(2)),
      estimatedElevationGain: finishedRecord.elevationGain,
      estimatedDurationMin: Math.max(1, Math.round(finishedRecord.durationSeconds / 60)),
      difficulty: finishedRecord.distanceMeters <= 3500 ? 'Dễ' : 'Vừa',
      coordinates: finishedRecord.coordinates,
      score: 1,
      source: 'recorded',
    };

    const savedRoutes = [
      savedRoute,
      ...get().savedRoutes.filter(route => route.id !== savedRoute.id),
    ].slice(0, MAX_SAVED_ROUTES);
    const suggestions = mergeSuggestions(savedRoutes, getGeneratedRoutes(get().suggestions));

    set({
      savedRoutes,
      suggestions,
      selectedRoute: savedRoute,
      finishedRecord: null,
      phase: 'pre',
    });

    await storage.setItem(ROUTE_STORAGE_KEY.SAVED_ROUTE_SUGGESTIONS, JSON.stringify(savedRoutes));
    appToast.success('Đã lưu lộ trình', 'Lộ trình đã xuất hiện trong danh sách gợi ý để bạn dùng lại.');
  },
  pauseRecording: () =>
    set(state => {
      if (!state.isRecording || state.isPaused) {
        return state;
      }

      return {
        isPaused: true,
        pausedAt: Date.now(),
      };
    }),
  resumeRecording: () =>
    set(state => {
      if (!state.isPaused || state.pausedAt == null) {
        return state;
      }

      const resumedAt = Date.now();
      const pausedDurationMs = state.pausedDurationMs + (resumedAt - state.pausedAt);
      const elapsedSeconds =
        state.startedAt == null ? state.elapsedSeconds : Math.max(0, Math.floor((resumedAt - state.startedAt - pausedDurationMs) / 1000));

      return {
        isPaused: false,
        pausedAt: null,
        pausedDurationMs,
        elapsedSeconds,
      };
    }),
  startRecording: (title, startedAt = Date.now()) =>
    set({
      isRecording: true,
      isPaused: false,
      elapsedSeconds: 0,
      liveCoordinates: [],
      recordingTitle: title,
      startedAt,
      pausedAt: null,
      pausedDurationMs: 0,
      lastDistanceChangeAt: startedAt,
    }),
  stopRecording: () =>
    set({
      isRecording: false,
      isPaused: false,
      startedAt: null,
      pausedAt: null,
      pausedDurationMs: 0,
      lastDistanceChangeAt: null,
    }),
  resetRecording: () => set(resetRecordingState),
  syncElapsedTime: (referenceTime = Date.now()) => {
    const { isRecording, startedAt, isPaused, pausedAt, pausedDurationMs, elapsedSeconds } = get();

    if (!isRecording || startedAt == null) {
      return;
    }

    const effectiveNow = isPaused && pausedAt != null ? pausedAt : referenceTime;
    const nextElapsedSeconds = Math.max(0, Math.floor((effectiveNow - startedAt - pausedDurationMs) / 1000));

    if (nextElapsedSeconds !== elapsedSeconds) {
      set({ elapsedSeconds: nextElapsedSeconds });
    }
  },
  addLiveCoordinate: (coord, sampleTimestamp = Date.now()) => {
    const { isRecording, isPaused, liveCoordinates } = get();
    if (!isRecording || isPaused) {
      return false;
    }

    const lastCoord = liveCoordinates[liveCoordinates.length - 1];
    if (lastCoord && distanceBetweenMeters(lastCoord, coord) < MIN_DISTANCE * 1000) {
      return false;
    }

    set({
      liveCoordinates: [...liveCoordinates, coord],
      lastDistanceChangeAt: sampleTimestamp,
    });

    return true;
  },
  shouldAutoDiscard: (referenceTime = Date.now()) => {
    const { isRecording, isPaused, lastDistanceChangeAt } = get();

    if (!isRecording || isPaused || lastDistanceChangeAt == null) {
      return false;
    }

    return referenceTime - lastDistanceChangeAt >= AUTO_DISCARD_AFTER_MS;
  },
}));

export function useRouteRecordLifecycle() {
  const phase = useRouteRecordStore(state => state.phase);
  const isRecording = useRouteRecordStore(state => state.isRecording);
  const isPaused = useRouteRecordStore(state => state.isPaused);
  const hydrateSavedRoutesFromStorage = useRouteRecordStore(state => state.hydrateSavedRoutesFromStorage);
  const resolveCurrentLocation = useRouteRecordStore(state => state.resolveCurrentLocation);
  const syncElapsedTime = useRouteRecordStore(state => state.syncElapsedTime);
  const shouldAutoDiscard = useRouteRecordStore(state => state.shouldAutoDiscard);
  const discardRecording = useRouteRecordStore(state => state.discardRecording);

  useEffect(() => {
    void hydrateSavedRoutesFromStorage();
  }, [hydrateSavedRoutesFromStorage]);

  useEffect(() => {
    if (phase === 'pre') {
      void resolveCurrentLocation({ forceFocus: true });
    }
  }, [phase, resolveCurrentLocation]);

  useEffect(() => {
    syncElapsedTime();

    if (!isRecording || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      const state = useRouteRecordStore.getState();
      state.syncElapsedTime();

      if (state.shouldAutoDiscard()) {
        void state.discardRecording();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [discardRecording, isPaused, isRecording, shouldAutoDiscard, syncElapsedTime]);
}
