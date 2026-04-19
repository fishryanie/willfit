import * as Location from 'expo-location';
import { storage, StorageKeys } from 'lib/storage';
import {
  Bike,
  Check,
  Coffee,
  Download,
  Flame,
  Footprints,
  Flag,
  Layers,
  type LucideIcon,
  LocateFixed,
  MapPinned,
  Mountain,
  Pause,
  Play,
  RadioTower,
  Search,
  Share2,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Undo2,
  Waves,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { ModernSwipeButton } from 'components/map/modern-swipe-button';
import {
  DEFAULT_COORDINATE,
  calculateTrackDistance,
  coordinateAtDistance,
  createFallbackRoute,
  createHeatRoutes,
  createLoopWaypoints,
  createRouteSummaries,
  createSegments,
  fetchOsrmRoute,
  formatDistance,
  formatDuration,
  formatPace,
} from './route-utils';
import { RouteMap } from './route-map';
import { ActivityMode, Coordinate, MapLayer, RouteSummary } from './types';

type Panel = 'routes' | 'segments' | 'record';
type RoutePriority = 'Popular' | 'Direct';
type ElevationPreference = 'Any' | 'Flat' | 'Hilly';
type SurfacePreference = 'Any' | 'Paved' | 'Dirt';
type SegmentFilter = 'Popular' | 'Short' | 'Climbs' | 'Starred';
type RouteChoice = RouteSummary & {
  coordinates?: Coordinate[];
  savedAt?: string;
  source: 'generated' | 'saved';
};

const SAVED_ROUTES_KEY = StorageKeys.SAVED_ROUTES;

const ACTIVITY_MODES: { id: ActivityMode; label: string; icon: LucideIcon }[] = [
  { id: 'run', label: 'Run', icon: Footprints },
  { id: 'ride', label: 'Ride', icon: Bike },
  { id: 'walk', label: 'Walk', icon: Footprints },
  { id: 'hike', label: 'Hike', icon: Mountain },
];

const SEGMENT_FILTERS: SegmentFilter[] = ['Popular', 'Short', 'Climbs', 'Starred'];

const POI_STARTS = [
  { id: 'trailhead', title: 'Trailhead', meta: 'Popular start', distanceKm: 0.82, bearing: 54, icon: Flag },
  { id: 'cafe', title: 'Cafe', meta: 'Water + coffee', distanceKm: 1.1, bearing: 130, icon: Coffee },
  { id: 'fountain', title: 'Fountain', meta: 'Refill stop', distanceKm: 0.68, bearing: 245, icon: MapPinned },
];

export function StravaMapScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [center, setCenter] = useState<Coordinate>(DEFAULT_COORDINATE);
  const [activePanel, setActivePanel] = useState<Panel>('routes');
  const [activityMode, setActivityMode] = useState<ActivityMode>('run');
  const [mapLayer, setMapLayer] = useState<MapLayer>('standard');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSegments, setShowSegments] = useState(true);
  const [followUser, setFollowUser] = useState(true);
  const [beaconEnabled, setBeaconEnabled] = useState(false);
  const [routePriority, setRoutePriority] = useState<RoutePriority>('Popular');
  const [elevationPreference, setElevationPreference] = useState<ElevationPreference>('Any');
  const [surfacePreference, setSurfacePreference] = useState<SurfacePreference>('Any');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('Popular');
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<RouteChoice[]>([]);
  const [recordingTitle, setRecordingTitle] = useState('Free run');
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [waypoints, setWaypoints] = useState<Coordinate[]>([]);
  const [manualMode, setManualMode] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState('morning-loop');
  const [selectedSegmentId, setSelectedSegmentId] = useState('sprint-bridge');
  const [isRouting, setIsRouting] = useState(false);
  const [routeSource, setRouteSource] = useState<'osrm' | 'local'>('local');
  const [locationStatus, setLocationStatus] = useState('Finding location...');
  const [isLocationReady, setIsLocationReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveCoordinates, setLiveCoordinates] = useState<Coordinate[]>([]);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const isPausedRef = useRef(false);
  const initialRouteBuilt = useRef(false);
  const liveCoordinatesRef = useRef<Coordinate[]>([]);

  const minSheetHeight = Math.max(210, height * 0.24);
  const midSheetHeight = Math.max(360, height * 0.47);
  const maxSheetHeight = Math.max(520, height - insets.top - 72);
  const sheetHeight = useSharedValue(midSheetHeight);
  const gestureStartHeight = useSharedValue(midSheetHeight);

  const routeSuggestions = useMemo(() => createRouteSummaries(center), [center]);
  const routeChoices = useMemo<RouteChoice[]>(
    () => [
      ...savedRoutes,
      ...routeSuggestions.map(route => ({
        ...route,
        source: 'generated' as const,
      })),
    ],
    [routeSuggestions, savedRoutes],
  );
  const segments = useMemo(() => createSegments(center), [center]);
  const heatRoutes = useMemo(() => createHeatRoutes(center), [center]);
  const filteredSegments = useMemo(() => {
    switch (segmentFilter) {
      case 'Short':
        return segments.filter(segment => segment.distanceKm < 1);
      case 'Climbs':
        return segments.filter(segment => segment.grade.includes('+'));
      case 'Starred':
        return segments.filter(segment => segment.starred);
      default:
        return segments;
    }
  }, [segmentFilter, segments]);
  const routeDistanceMeters = useMemo(() => calculateTrackDistance(routeCoordinates), [routeCoordinates]);
  const liveDistanceMeters = useMemo(() => calculateTrackDistance(liveCoordinates), [liveCoordinates]);
  const selectedSegment = filteredSegments.find(segment => segment.id === selectedSegmentId) ?? filteredSegments[0] ?? segments[0];
  const selectedRoute =
    routeChoices.find(route => route.id === selectedRouteId) ??
    routeChoices[0] ??
    {
      ...routeSuggestions[0],
      source: 'generated' as const,
    };

  const snapSheet = useCallback(
    (targetHeight: number) => {
      sheetHeight.value = withSpring(targetHeight, {
        damping: 22,
        stiffness: 190,
      });
    },
    [sheetHeight],
  );

  const sheetGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          gestureStartHeight.value = sheetHeight.value;
        })
        .onUpdate(event => {
          const nextHeight = gestureStartHeight.value - event.translationY;
          sheetHeight.value = Math.min(maxSheetHeight, Math.max(minSheetHeight, nextHeight));
        })
        .onEnd(() => {
          const currentHeight = sheetHeight.value;
          const snaps = [minSheetHeight, midSheetHeight, maxSheetHeight];
          const target = snaps.reduce((closest, snap) =>
            Math.abs(snap - currentHeight) < Math.abs(closest - currentHeight) ? snap : closest,
          );

          sheetHeight.value = withSpring(target, {
            damping: 22,
            stiffness: 190,
          });
        }),
    [gestureStartHeight, maxSheetHeight, midSheetHeight, minSheetHeight, sheetHeight],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const requestLocation = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setLocationStatus('Location permission is off. Showing Ho Chi Minh City.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextCenter = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCenter(nextCenter);
      setLocationStatus('Using your current location');
    } catch {
      setLocationStatus('Could not read GPS. Showing Ho Chi Minh City.');
    } finally {
      setIsLocationReady(true);
    }
  }, []);

  const buildRoute = useCallback(
    async (route: RouteChoice, overrideMode = activityMode) => {
      if (route.coordinates && route.coordinates.length > 1) {
        setSelectedRouteId(route.id);
        setWaypoints([route.coordinates[0], route.coordinates[route.coordinates.length - 1]]);
        setRouteCoordinates(route.coordinates);
        setRouteSource('local');
        return;
      }

      const nextWaypoints = createLoopWaypoints(center, route.distanceKm);
      setSelectedRouteId(route.id);
      setWaypoints(nextWaypoints);
      setIsRouting(true);

      try {
        const osrmRoute = await fetchOsrmRoute(nextWaypoints, overrideMode);
        setRouteCoordinates(osrmRoute);
        setRouteSource('osrm');
      } catch {
        setRouteCoordinates(createFallbackRoute(nextWaypoints));
        setRouteSource('local');
      } finally {
        setIsRouting(false);
      }
    },
    [activityMode, center],
  );

  const handleMapPress = useCallback(
    async (coordinate: Coordinate) => {
      if (!manualMode) {
        setCenter(coordinate);
        return;
      }

      const nextWaypoints = [...waypoints, coordinate];
      setWaypoints(nextWaypoints);

      if (nextWaypoints.length < 2) {
        setRouteCoordinates(nextWaypoints);
        return;
      }

      setIsRouting(true);

      try {
        const osrmRoute = await fetchOsrmRoute(nextWaypoints, activityMode);
        setRouteCoordinates(osrmRoute);
        setRouteSource('osrm');
      } catch {
        setRouteCoordinates(createFallbackRoute(nextWaypoints));
        setRouteSource('local');
      } finally {
        setIsRouting(false);
      }
    },
    [activityMode, manualMode, waypoints],
  );

  const clearRoute = useCallback(() => {
    setWaypoints([]);
    setRouteCoordinates([]);
    setManualMode(false);
  }, []);

  const routeToPoi = useCallback(
    async (distanceKm: number, bearing: number) => {
      const poiCoordinate = coordinateAtDistance(center, distanceKm, bearing);
      const nextWaypoints = [center, poiCoordinate];

      setManualMode(false);
      setWaypoints(nextWaypoints);
      setIsRouting(true);

      try {
        const osrmRoute = await fetchOsrmRoute(nextWaypoints, activityMode);
        setRouteCoordinates(osrmRoute);
        setRouteSource('osrm');
      } catch {
        setRouteCoordinates(createFallbackRoute(nextWaypoints));
        setRouteSource('local');
      } finally {
        setIsRouting(false);
      }
    },
    [activityMode, center],
  );

  const persistSavedRoutes = useCallback((routes: RouteChoice[]) => {
    storage.set(SAVED_ROUTES_KEY, JSON.stringify(routes.slice(0, 8)));
  }, []);

  const startRecording = useCallback(async (mode: 'route' | 'free' = 'route') => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Location needed', 'Turn on location permission to record an activity.');
      return;
    }

    if (mode === 'free') {
      setRouteCoordinates([]);
      setWaypoints([]);
      setRecordingTitle('Free run');
    } else {
      setRecordingTitle(selectedRoute?.title ?? 'Suggested route');
    }

    setIsRecording(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setLiveCoordinates([]);
    liveCoordinatesRef.current = [];
    setActivePanel('record');
    snapSheet(midSheetHeight);

    watchSubscription.current?.remove();
    watchSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      position => {
        if (isPausedRef.current) {
          return;
        }

        const coordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCenter(coordinate);
        setLiveCoordinates(previous => {
          const nextCoordinates = [...previous, coordinate];
          liveCoordinatesRef.current = nextCoordinates;
          return nextCoordinates;
        });
      },
    );
  }, [midSheetHeight, selectedRoute?.title, snapSheet]);

  const finishRecording = useCallback(() => {
    watchSubscription.current?.remove();
    watchSubscription.current = null;
    setIsRecording(false);
    setIsPaused(false);

    const recordedTrack = liveCoordinatesRef.current;

    if (recordedTrack.length < 2) {
      return;
    }

    const distanceMeters = calculateTrackDistance(recordedTrack);
    const savedRoute: RouteChoice = {
      id: `saved-${Date.now()}`,
      title: recordingTitle === 'Free run' ? `Saved run ${savedRoutes.length + 1}` : recordingTitle,
      distanceKm: Number((distanceMeters / 1000).toFixed(2)),
      elevationM: 0,
      estimatedMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      surface: 'Recorded GPS',
      popularity: 100,
      coordinates: recordedTrack,
      savedAt: new Date().toISOString(),
      source: 'saved',
    };

    setSavedRoutes(current => {
      const nextRoutes = [savedRoute, ...current].slice(0, 8);
      persistSavedRoutes(nextRoutes);
      return nextRoutes;
    });

    setSelectedRouteId(savedRoute.id);
    setRouteCoordinates(recordedTrack);
    setWaypoints([recordedTrack[0], recordedTrack[recordedTrack.length - 1]]);
    setRouteSource('local');
    setActivePanel('routes');
    snapSheet(midSheetHeight);
  }, [elapsedSeconds, midSheetHeight, persistSavedRoutes, recordingTitle, savedRoutes.length, snapSheet]);

  const pauseRecording = useCallback(() => {
    setIsPaused(value => !value);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    liveCoordinatesRef.current = liveCoordinates;
  }, [liveCoordinates]);

  useEffect(() => {
    const value = storage.getString(SAVED_ROUTES_KEY);

    if (value) {
      try {
        const parsedRoutes = JSON.parse(value) as RouteChoice[];
        setSavedRoutes(parsedRoutes.filter(route => route.coordinates && route.coordinates.length > 1));
      } catch (error) {
        console.error('Failed to parse saved routes:', error);
      }
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!isLocationReady || initialRouteBuilt.current) {
      return;
    }

    initialRouteBuilt.current = true;
    if (routeChoices[0]) {
      buildRoute(routeChoices[0]);
    }
  }, [buildRoute, isLocationReady, routeChoices]);

  useEffect(() => {
    if (!isRecording || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(value => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isRecording]);

  useEffect(() => {
    return () => {
      watchSubscription.current?.remove();
    };
  }, []);

  return (
    <ThemedView flex backgroundColor='#101114'>
      <RouteMap
        center={center}
        routeCoordinates={routeCoordinates}
        liveCoordinates={liveCoordinates}
        waypoints={waypoints}
        heatRoutes={heatRoutes}
        segments={segments}
        selectedSegmentId={selectedSegmentId}
        showHeatmap={showHeatmap}
        showSegments={showSegments}
        mapLayer={mapLayer}
        activityMode={activityMode}
        followUser={followUser}
        onMapPress={handleMapPress}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchPill}>
          <Search size={18} color='#6B7280' />
          <ThemedText numberOfLines={1} style={styles.searchText}>
            Search location, route, segment
          </ThemedText>
        </View>
        <TouchableOpacity
          activeOpacity={0.78}
          style={styles.iconButton}
          onPress={() => setMapLayer(value => (value === 'standard' ? 'satellite' : 'standard'))}>
          <Layers size={20} color='#111111' />
        </TouchableOpacity>
      </View>

      <View style={[styles.mapControls, { top: insets.top + 74 }]}>
        <TouchableOpacity
          activeOpacity={0.78}
          style={[styles.floatingButton, followUser && styles.floatingButtonActive]}
          onPress={() => {
            setFollowUser(value => !value);
            snapSheet(minSheetHeight);
          }}>
          <LocateFixed size={20} color={followUser ? '#FFFFFF' : '#111111'} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.78}
          style={[styles.floatingButton, showHeatmap && styles.floatingButtonActive]}
          onPress={() => setShowHeatmap(value => !value)}>
          <Waves size={20} color={showHeatmap ? '#FFFFFF' : '#111111'} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.78}
          style={[styles.floatingButton, beaconEnabled && styles.beaconActive]}
          onPress={() => setBeaconEnabled(value => !value)}>
          <RadioTower size={20} color={beaconEnabled ? '#FFFFFF' : '#111111'} />
        </TouchableOpacity>
      </View>

      <View style={[styles.statusPill, { top: insets.top + 78 }]}>
        <View style={[styles.statusDot, routeSource === 'osrm' ? styles.statusDotOnline : styles.statusDotLocal]} />
        <ThemedText numberOfLines={1} style={styles.statusText}>
          {isRouting ? 'Building route...' : routeSource === 'osrm' ? 'Route by OSRM' : locationStatus}
        </ThemedText>
      </View>

      {!isRecording && (
        <TouchableOpacity
          activeOpacity={0.86}
          style={[styles.searchHereButton, { top: insets.top + 126 }]}
          onPress={() => {
            const nearestRoute = routeSuggestions[0];

            if (!nearestRoute) {
              return;
            }

            setSelectedRouteId(nearestRoute.id);
            buildRoute({
              ...nearestRoute,
              source: 'generated',
            });
            snapSheet(midSheetHeight);
          }}>
          <ThemedText style={styles.searchHereText}>Tìm kiếm tại đây</ThemedText>
        </TouchableOpacity>
      )}

      <GestureDetector gesture={sheetGesture}>
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }, sheetStyle]}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.panelTabs}>
            {(['routes', 'segments', 'record'] as Panel[]).map(panel => {
              const isActive = activePanel === panel;
              return (
                <TouchableOpacity
                  key={panel}
                  activeOpacity={0.82}
                  style={[styles.panelTab, isActive && styles.panelTabActive]}
                  onPress={() => {
                    setActivePanel(panel);
                    snapSheet(panel === 'record' ? midSheetHeight : maxSheetHeight);
                  }}>
                  <ThemedText style={[styles.panelTabText, isActive && styles.panelTabTextActive]}>
                    {panel[0].toUpperCase() + panel.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            {activePanel === 'routes' && (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <ThemedText style={styles.sheetTitle}>Cung đường gần bạn</ThemedText>
                    <ThemedText style={styles.sheetSubtitle}>
                      Gợi ý quanh vị trí hiện tại, hoặc ghi lại cung đường mới.
                    </ThemedText>
                  </View>
                  {isRouting && <ActivityIndicator color='#FF5A1F' />}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>
                  {ACTIVITY_MODES.map(mode => {
                    const Icon = mode.icon;
                    const isActive = activityMode === mode.id;

                    return (
                      <TouchableOpacity
                        key={mode.id}
                        activeOpacity={0.82}
                        style={[styles.modeChip, isActive && styles.modeChipActive]}
                        onPress={() => {
                          setActivityMode(mode.id);
                          buildRoute(selectedRoute, mode.id);
                        }}>
                        <Icon size={16} color={isActive ? '#FFFFFF' : '#111111'} />
                        <ThemedText style={[styles.modeText, isActive && styles.modeTextActive]}>{mode.label}</ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.preferenceGrid}>
                  <PreferenceChip
                    label='Routing'
                    value={routePriority}
                    onPress={() => setRoutePriority(value => (value === 'Popular' ? 'Direct' : 'Popular'))}
                  />
                  <PreferenceChip
                    label='Elevation'
                    value={elevationPreference}
                    onPress={() =>
                      setElevationPreference(value => (value === 'Any' ? 'Flat' : value === 'Flat' ? 'Hilly' : 'Any'))
                    }
                  />
                  <PreferenceChip
                    label='Surface'
                    value={surfacePreference}
                    onPress={() =>
                      setSurfacePreference(value => (value === 'Any' ? 'Paved' : value === 'Paved' ? 'Dirt' : 'Any'))
                    }
                  />
                  <PreferenceChip
                    label='Offline'
                    value={offlineSaved ? 'Saved' : 'Save'}
                    onPress={() => setOfflineSaved(value => !value)}
                  />
                </View>

                <View style={styles.routeStats}>
                  <StatBlock label='Distance' value={formatDistance(routeDistanceMeters)} />
                  <StatBlock label='Elevation' value={`${selectedRoute.elevationM} m`} />
                  <StatBlock label='Time' value={`${selectedRoute.estimatedMinutes}m`} />
                </View>

                <View style={styles.actionRow}>
                  <ActionButton
                    label='Record now'
                    icon={Timer}
                    active={isRecording && recordingTitle === 'Free run'}
                    onPress={() => {
                      setActivePanel('record');
                      snapSheet(midSheetHeight);
                    }}
                  />
                  <ActionButton
                    label={manualMode ? 'Tap map to add' : 'Manual mode'}
                    icon={manualMode ? Check : MapPinned}
                    active={manualMode}
                    onPress={() => {
                      setManualMode(value => !value);
                      snapSheet(minSheetHeight);
                    }}
                  />
                  <ActionButton label='Clear' icon={Undo2} onPress={clearRoute} />
                </View>

                <View style={styles.poiPanel}>
                  <View style={styles.poiHeader}>
                    <View>
                      <ThemedText style={styles.poiTitle}>Start points nearby</ThemedText>
                      <ThemedText style={styles.poiMeta}>Tap a popular spot to route there.</ThemedText>
                    </View>
                    <Download size={18} color={offlineSaved ? '#36D399' : '#737780'} />
                  </View>

                  {POI_STARTS.map(poi => {
                    const Icon = poi.icon;

                    return (
                      <TouchableOpacity
                        key={poi.id}
                        activeOpacity={0.82}
                        style={styles.poiRow}
                        onPress={() => routeToPoi(poi.distanceKm, poi.bearing)}>
                        <View style={styles.poiIcon}>
                          <Icon size={16} color='#111111' />
                        </View>
                        <View style={styles.poiBody}>
                          <ThemedText style={styles.poiName}>{poi.title}</ThemedText>
                          <ThemedText style={styles.poiDistance}>
                            {poi.meta} • {poi.distanceKm.toFixed(1)} km
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.poiCta}>Route here</ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {routeChoices.map(route => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    active={selectedRouteId === route.id}
                    onPress={() => buildRoute(route)}
                    onStart={() => startRecording('route')}
                    isRecording={isRecording}
                  />
                ))}

                <View style={styles.directRecordCard}>
                  <View>
                    <ThemedText style={styles.directRecordTitle}>Tự record luôn</ThemedText>
                    <ThemedText style={styles.directRecordMeta}>
                      Không cần chọn route, WillFit sẽ lưu track này sau khi kết thúc.
                    </ThemedText>
                  </View>
                  <ModernSwipeButton
                    label='Trượt để bắt đầu ghi'
                    completeLabel='Đang ghi'
                    disabled={isRecording}
                    onComplete={() => startRecording('free')}
                  />
                </View>
              </>
            )}

            {activePanel === 'segments' && (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <ThemedText style={styles.sheetTitle}>Nearby segments</ThemedText>
                    <ThemedText style={styles.sheetSubtitle}>Star, preview, and chase local efforts</ThemedText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    style={[styles.smallToggle, showSegments && styles.smallToggleActive]}
                    onPress={() => setShowSegments(value => !value)}>
                    <TrendingUp size={16} color={showSegments ? '#FFFFFF' : '#111111'} />
                  </TouchableOpacity>
                </View>

                <View style={styles.segmentHero}>
                  <View>
                    <ThemedText style={styles.segmentHeroTitle}>{selectedSegment.title}</ThemedText>
                    <ThemedText style={styles.segmentHeroMeta}>
                      {selectedSegment.distanceKm.toFixed(2)} km • {selectedSegment.grade} • PR {selectedSegment.bestTime}
                    </ThemedText>
                  </View>
                  <View style={styles.segmentHeroActions}>
                    <Share2 size={18} color='#FFFFFF' />
                    <Flame size={28} color='#FF5A1F' />
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentFilterRow}>
                  {SEGMENT_FILTERS.map(filter => {
                    const isActive = segmentFilter === filter;

                    return (
                      <TouchableOpacity
                        key={filter}
                        activeOpacity={0.82}
                        style={[styles.segmentFilterChip, isActive && styles.segmentFilterChipActive]}
                        onPress={() => setSegmentFilter(filter)}>
                        <ThemedText style={[styles.segmentFilterText, isActive && styles.segmentFilterTextActive]}>
                          {filter}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {filteredSegments.map(segment => (
                  <TouchableOpacity
                    key={segment.id}
                    activeOpacity={0.82}
                    style={[styles.segmentCard, selectedSegmentId === segment.id && styles.segmentCardActive]}
                    onPress={() => setSelectedSegmentId(segment.id)}>
                    <View style={styles.segmentIcon}>
                      {segment.starred ? <Star size={17} color='#FF8A00' fill='#FF8A00' /> : <TrendingUp size={17} color='#36D399' />}
                    </View>
                    <View style={styles.segmentContent}>
                      <ThemedText style={styles.segmentTitle}>{segment.title}</ThemedText>
                      <ThemedText style={styles.segmentMeta}>
                        {segment.distanceKm.toFixed(2)} km • {segment.grade} • best {segment.bestTime}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {activePanel === 'record' && (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <ThemedText style={styles.sheetTitle}>
                      {isRecording ? recordingTitle : 'Record activity'}
                    </ThemedText>
                    <ThemedText style={styles.sheetSubtitle}>
                      {isRecording ? 'Trượt để kết thúc và lưu lại cung đường.' : 'Record ngay, rồi lưu route cho lần sau.'}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    style={[styles.beaconPill, beaconEnabled && styles.beaconPillActive]}
                    onPress={() => setBeaconEnabled(value => !value)}>
                    <RadioTower size={15} color={beaconEnabled ? '#FFFFFF' : '#111111'} />
                    <ThemedText style={[styles.beaconText, beaconEnabled && styles.beaconTextActive]}>Beacon</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.recordGrid}>
                  <StatBlock label='Time' value={formatDuration(elapsedSeconds)} />
                  <StatBlock label='Distance' value={formatDistance(liveDistanceMeters)} />
                  <StatBlock label='Pace' value={formatPace(liveDistanceMeters, elapsedSeconds)} />
                  <StatBlock label='Splits' value={liveDistanceMeters > 1000 ? '1 logged' : '--'} />
                </View>

                <View style={styles.recordControlsNew}>
                  {!isRecording ? (
                    <ModernSwipeButton
                      label='Trượt để bắt đầu ghi'
                      onComplete={() => startRecording('free')}
                    />
                  ) : (
                    <>
                      <View style={styles.secondaryControls}>
                        <TouchableOpacity activeOpacity={0.88} style={styles.pauseButtonNew} onPress={pauseRecording}>
                          <View style={styles.pauseIconWrap}>
                            {isPaused ? <Play size={20} color='#111111' fill='#111111' /> : <Pause size={20} color='#111111' fill='#111111' />}
                          </View>
                          <ThemedText style={styles.pauseLabel}>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</ThemedText>
                        </TouchableOpacity>
                      </View>
                      <ModernSwipeButton
                        tone='finish'
                        label='Trượt để kết thúc và lưu'
                        onComplete={finishRecording}
                      />
                    </>
                  )}
                </View>

                <View style={styles.liveSplits}>
                  <View style={styles.splitIcon}>
                    <Timer size={18} color='#FF8A00' />
                  </View>
                  <View>
                    <ThemedText style={styles.splitTitle}>Auto splits</ThemedText>
                    <ThemedText style={styles.splitMeta}>Every kilometer gets summarized while recording.</ThemedText>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </GestureDetector>

    </ThemedView>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  icon: Icon,
  active,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[styles.actionButton, active && styles.actionButtonActive]}
      onPress={onPress}>
      <Icon size={16} color={active ? '#FFFFFF' : '#111111'} />
      <ThemedText style={[styles.actionText, active && styles.actionTextActive]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

function PreferenceChip({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.82} style={styles.preferenceChip} onPress={onPress}>
      <ThemedText style={styles.preferenceLabel}>{label}</ThemedText>
      <ThemedText style={styles.preferenceValue}>{value}</ThemedText>
    </TouchableOpacity>
  );
}

function RouteCard({
  route,
  active,
  onPress,
  onStart,
  isRecording,
}: {
  route: RouteChoice;
  active: boolean;
  onPress: () => void;
  onStart: () => void;
  isRecording: boolean;
}) {
  return (
    <TouchableOpacity activeOpacity={0.84} style={[styles.routeCard, active && styles.routeCardActive]} onPress={onPress}>
      <View style={styles.routePreview}>
        <View style={styles.routePreviewGlow} />
        <MapPinned size={22} color='#FFFFFF' />
      </View>
      <View style={styles.routeCardBody}>
        <View style={styles.routeCardHeader}>
          <ThemedText numberOfLines={1} style={styles.routeTitle}>{route.title}</ThemedText>
          <View style={[styles.routeBadge, route.source === 'saved' && styles.savedBadge]}>
            {route.source === 'saved' ? <Download size={12} color='#5BD67D' /> : <Sparkles size={12} color='#FF8A00' />}
            <ThemedText style={[styles.routeBadgeText, route.source === 'saved' && styles.savedBadgeText]}>
              {route.source === 'saved' ? 'Đã lưu' : 'Gợi ý'}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.routeMeta}>
          {route.distanceKm.toFixed(1)} km • {route.elevationM} m • {route.estimatedMinutes} phút
        </ThemedText>
        <ThemedText style={styles.routeSurface}>
          {route.surface} • riêng tư cho bạn
        </ThemedText>
        {active ? (
          <View style={styles.routeStartWrap}>
            <ModernSwipeButton
              label='Trượt để bắt đầu cung đường'
              completeLabel='Đang chạy'
              disabled={isRecording}
              onComplete={onStart}
            />
          </View>
        ) : (
          <ThemedText style={styles.routePreviewText}>Chạm để xem trên bản đồ</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  searchPill: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 5,
  },
  searchText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapControls: {
    position: 'absolute',
    right: 14,
    gap: 10,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  floatingButtonActive: {
    backgroundColor: '#111111',
  },
  beaconActive: {
    backgroundColor: '#FF5A1F',
  },
  statusPill: {
    position: 'absolute',
    left: 14,
    maxWidth: 245,
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotOnline: {
    backgroundColor: '#36D399',
  },
  statusDotLocal: {
    backgroundColor: '#FF8A00',
  },
  statusText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  searchHereButton: {
    position: 'absolute',
    alignSelf: 'center',
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  searchHereText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 9,
    paddingBottom: 7,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  panelTabs: {
    flexDirection: 'row',
    marginHorizontal: 14,
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F1F2F4',
  },
  panelTab: {
    flex: 1,
    minHeight: 36,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTabActive: {
    backgroundColor: '#111111',
  },
  panelTabText: {
    color: '#60646C',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0,
  },
  panelTabTextActive: {
    color: '#FFFFFF',
  },
  sheetContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sheetTitle: {
    color: '#111111',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: 0,
  },
  sheetSubtitle: {
    color: '#737780',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    letterSpacing: 0,
  },
  modeRow: {
    gap: 10,
    paddingBottom: 12,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: '#F1F2F4',
  },
  modeChipActive: {
    backgroundColor: '#FF5A1F',
  },
  modeText: {
    color: '#111111',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0,
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  preferenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  preferenceChip: {
    minWidth: '48%',
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F7F7F8',
    borderWidth: 1,
    borderColor: '#ECEEF1',
  },
  preferenceLabel: {
    color: '#777B84',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
  },
  preferenceValue: {
    marginTop: 3,
    color: '#111111',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  statBlock: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F7F7F8',
  },
  statValue: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  statLabel: {
    marginTop: 3,
    color: '#777B84',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: '#F1F2F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: '#111111',
  },
  actionText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  actionTextActive: {
    color: '#FFFFFF',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    marginBottom: 10,
  },
  routeCardActive: {
    borderColor: '#FF5A1F',
    backgroundColor: '#FFF5F0',
  },
  routePreview: {
    width: 78,
    height: 78,
    borderRadius: 8,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  routePreviewGlow: {
    position: 'absolute',
    width: 96,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 90, 31, 0.78)',
    transform: [{ rotate: '-28deg' }],
  },
  routeCardBody: {
    flex: 1,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  routeTitle: {
    flex: 1,
    color: '#111111',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0,
  },
  routeBadge: {
    minHeight: 26,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFF0E8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  savedBadge: {
    backgroundColor: '#EAF9F0',
  },
  routeBadgeText: {
    color: '#FF5A1F',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  savedBadgeText: {
    color: '#198D4C',
  },
  routeSurface: {
    marginTop: 2,
    color: '#FF5A1F',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  routeMeta: {
    marginTop: 4,
    color: '#737780',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  routeStartWrap: {
    marginTop: 12,
  },
  routePreviewText: {
    marginTop: 8,
    color: '#737780',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  directRecordCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    backgroundColor: '#FFFFFF',
    padding: 13,
    gap: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  directRecordTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
  },
  directRecordMeta: {
    marginTop: 4,
    color: '#737780',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    letterSpacing: 0,
  },
  poiPanel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECEEF1',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  poiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  poiTitle: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  poiMeta: {
    marginTop: 2,
    color: '#737780',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  poiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F1F2F4',
  },
  poiIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poiBody: {
    flex: 1,
  },
  poiName: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  poiDistance: {
    marginTop: 2,
    color: '#737780',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
  poiCta: {
    color: '#FF5A1F',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  smallToggle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallToggleActive: {
    backgroundColor: '#111111',
  },
  segmentHero: {
    minHeight: 96,
    borderRadius: 8,
    backgroundColor: '#111111',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  segmentHeroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  segmentHeroMeta: {
    color: '#D1D5DB',
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  segmentHeroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  segmentFilterRow: {
    gap: 8,
    paddingBottom: 12,
  },
  segmentFilterChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F2F4',
  },
  segmentFilterChipActive: {
    backgroundColor: '#111111',
  },
  segmentFilterText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  segmentFilterTextActive: {
    color: '#FFFFFF',
  },
  segmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F7F7F8',
    marginBottom: 9,
  },
  segmentCardActive: {
    backgroundColor: '#FFF5F0',
  },
  segmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentContent: {
    flex: 1,
  },
  segmentTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  segmentMeta: {
    marginTop: 3,
    color: '#737780',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  beaconPill: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 8,
    backgroundColor: '#F1F2F4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beaconPillActive: {
    backgroundColor: '#FF5A1F',
  },
  beaconText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  beaconTextActive: {
    color: '#FFFFFF',
  },
  recordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recordControlsNew: {
    gap: 16,
    marginTop: 20,
    width: '100%',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pauseButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F2F4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
  pauseIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  pauseLabel: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
  },
  recordControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  finishSliderWrap: {
    flex: 1,
  },
  startButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: '#FF5A1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  pauseButton: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#F1F2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  liveSplits: {
    marginTop: 16,
    borderRadius: 8,
    padding: 13,
    backgroundColor: '#F7F7F8',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  splitIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitTitle: {
    color: '#111111',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0,
  },
  splitMeta: {
    color: '#737780',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0,
  },
});
