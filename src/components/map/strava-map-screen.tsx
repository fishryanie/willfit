import { ModernSwipeButton } from 'components/map/modern-swipe-button';
import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { CircularCarousel } from 'components/ui/molecules/circular-carousel';
import { SplitView } from 'components/ui/molecules/split-view';
import * as Location from 'expo-location';
import { storage } from 'lib/storage';
import { Download, Flame, Layers, LocateFixed, MapPinned, Pause, Play, RadioTower, Search, Sparkles, Timer, Waves } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, type ListRenderItem, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteMap } from './route-map';
import {
  DEFAULT_COORDINATE,
  calculateTrackDistance,
  createFallbackRoute,
  createHeatRoutes,
  createLoopWaypoints,
  createRouteSummaries,
  fetchOsrmRoute,
  formatDistance,
  formatDuration,
  formatPace,
} from './route-utils';
import { ActivityMode, Coordinate, MapLayer, RouteSummary } from './types';

type RouteChoice = RouteSummary & {
  coordinates?: Coordinate[];
  savedAt?: string;
  source: 'generated' | 'saved';
};
type RouteCarouselItem = { type: 'route'; route: RouteChoice } | { type: 'record' };
type RecordTopItem = { id: 'summary' } | { id: 'metrics' } | { id: 'controls' };
type RecordBottomItem = { id: 'route' } | { id: 'splits' };

const ACTIVITY_MODE_LABELS: Record<ActivityMode, string> = {
  run: 'Chạy bộ',
  walk: 'Đi bộ',
  ride: 'Đạp xe',
  hike: 'Leo núi',
};

const getNextActivityMode = (mode: ActivityMode): ActivityMode => {
  if (mode === 'run') {
    return 'walk';
  }

  if (mode === 'walk') {
    return 'ride';
  }

  return 'run';
};

export function StravaMapScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [center, setCenter] = useState<Coordinate>(DEFAULT_COORDINATE);
  const [recordPanelVisible, setRecordPanelVisible] = useState(false);
  const [activityMode, setActivityMode] = useState<ActivityMode>('run');
  const [mapLayer, setMapLayer] = useState<MapLayer>('standard');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [followUser, setFollowUser] = useState(true);
  const [beaconEnabled, setBeaconEnabled] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<RouteChoice[]>([]);
  const [recordingTitle, setRecordingTitle] = useState('Free run');
  const [recordStartMode, setRecordStartMode] = useState<'route' | 'free'>('free');
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [waypoints, setWaypoints] = useState<Coordinate[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('morning-loop');
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

  const routeSuggestions = useMemo(() => createRouteSummaries(center, activityMode), [activityMode, center]);
  const routeChoices = useMemo<RouteChoice[]>(
    () => [
      ...(activityMode === 'walk' ? savedRoutes.filter(route => route.distanceKm <= 10) : savedRoutes),
      ...routeSuggestions.map(route => ({
        ...route,
        source: 'generated' as const,
      })),
    ],
    [activityMode, routeSuggestions, savedRoutes],
  );
  const heatRoutes = useMemo(() => createHeatRoutes(center), [center]);
  const carouselCardWidth = width - 24;
  const carouselItems = useMemo<RouteCarouselItem[]>(
    () => [...routeChoices.map(route => ({ type: 'route' as const, route })), { type: 'record' as const }],
    [routeChoices],
  );
  const recordTopItems = useMemo<RecordTopItem[]>(() => [{ id: 'summary' }, { id: 'metrics' }, { id: 'controls' }], []);
  const recordBottomItems = useMemo<RecordBottomItem[]>(() => [{ id: 'route' }, { id: 'splits' }], []);
  const recordSplitMinTopHeight = Math.max(260, height * 0.34);
  const recordSplitMaxTopHeight = Math.max(recordSplitMinTopHeight + 120, height - insets.top - insets.bottom - 220);
  const recordSplitInitialTopHeight = Math.min(Math.max(360, height * 0.54), recordSplitMaxTopHeight);
  const recordSplitSpringConfig = useMemo(() => ({ damping: 22, stiffness: 190, mass: 0.85 }), []);
  const routeDistanceMeters = useMemo(() => calculateTrackDistance(routeCoordinates), [routeCoordinates]);
  const liveDistanceMeters = useMemo(() => calculateTrackDistance(liveCoordinates), [liveCoordinates]);
  const selectedRoute = useMemo(
    () =>
      routeChoices.find(route => route.id === selectedRouteId) ??
      routeChoices[0] ?? {
        ...routeSuggestions[0],
        source: 'generated' as const,
      },
    [routeChoices, routeSuggestions, selectedRouteId],
  );

  const requestLocation = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setLocationStatus('Location permission is off. Showing Ho Chi Minh City.');
        setIsLocationReady(true);
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
    }

    setIsLocationReady(true);
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
      }

      setIsRouting(false);
    },
    [activityMode, center],
  );

  const handleMapPress = useCallback((coordinate: Coordinate) => {
    setCenter(coordinate);
  }, []);

  const handleRouteCarouselIndexChange = useCallback(
    (index: number) => {
      const item = carouselItems[index];

      if (!item || item.type !== 'route' || item.route.id === selectedRouteId) {
        return;
      }

      void buildRoute(item.route);
    },
    [buildRoute, carouselItems, selectedRouteId],
  );

  const persistSavedRoutes = useCallback((routes: RouteChoice[]) => {
    void storage.setItem('willfit:saved-routes', JSON.stringify(routes.slice(0, 8)));
  }, []);

  const openRouteRecordSheet = useCallback(
    (route: RouteChoice) => {
      setRecordStartMode('route');
      setRecordingTitle(route.title);
      setRecordPanelVisible(true);
      void buildRoute(route);
    },
    [buildRoute],
  );

  const openFreeRecordSheet = useCallback(() => {
    setRecordStartMode('free');
    setRecordingTitle('Free run');
    setRouteCoordinates([]);
    setWaypoints([]);
    setRecordPanelVisible(true);
  }, []);

  const closeRecordSheet = useCallback(() => {
    setRecordPanelVisible(false);
  }, []);

  const startRecording = useCallback(
    async (mode: 'route' | 'free' = 'route') => {
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
        if (routeCoordinates.length < 2) {
          await buildRoute(selectedRoute);
        }
        setRecordingTitle(selectedRoute?.title ?? 'Suggested route');
      }

      setIsRecording(true);
      setIsPaused(false);
      setElapsedSeconds(0);
      setLiveCoordinates([]);
      liveCoordinatesRef.current = [];
      setRecordStartMode(mode);
      setRecordPanelVisible(true);

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
    },
    [buildRoute, routeCoordinates.length, selectedRoute],
  );

  const finishRecording = useCallback(() => {
    watchSubscription.current?.remove();
    watchSubscription.current = null;
    setIsRecording(false);
    setIsPaused(false);
    setRecordPanelVisible(false);

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
  }, [elapsedSeconds, persistSavedRoutes, recordingTitle, savedRoutes.length]);

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
    let isMounted = true;

    void storage.getItem('willfit:saved-routes').then(value => {
      if (!isMounted || !value) {
        return;
      }

      try {
        const parsedRoutes = JSON.parse(value) as RouteChoice[];
        setSavedRoutes(parsedRoutes.filter(route => route.coordinates && route.coordinates.length > 1));
      } catch (error) {
        console.error('Failed to parse saved routes:', error);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        void requestLocation();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [requestLocation]);

  useEffect(() => {
    if (!isLocationReady || initialRouteBuilt.current) {
      return;
    }

    const initialRoute = routeChoices[0];
    if (!initialRoute) {
      return;
    }

    initialRouteBuilt.current = true;
    queueMicrotask(() => {
      void buildRoute(initialRoute);
    });
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

  const renderRecordTopItem = useCallback<ListRenderItem<RecordTopItem>>(
    ({ item }) => {
      if (item.id === 'summary') {
        return (
          <View style={styles.sectionHeader}>
            <View style={styles.recordHeaderText}>
              <ThemedText style={styles.sheetTitle}>
                {isRecording ? recordingTitle : recordStartMode === 'route' ? recordingTitle : 'Record activity'}
              </ThemedText>
              <ThemedText style={styles.sheetSubtitle}>{isRecording ? 'Trượt để kết thúc và lưu lại cung đường.' : 'Vuốt để bắt đầu record.'}</ThemedText>
            </View>
            <View style={styles.sheetActionRow}>
              {!isRecording && (
                <TouchableOpacity activeOpacity={0.82} style={styles.changeRoutePill} onPress={closeRecordSheet}>
                  <Search size={14} color='#111111' />
                  <ThemedText style={styles.changeRouteText}>Đổi cung</ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.82}
                style={[styles.beaconPill, beaconEnabled && styles.beaconPillActive]}
                onPress={() => setBeaconEnabled(value => !value)}>
                <RadioTower size={15} color={beaconEnabled ? '#FFFFFF' : '#111111'} />
                <ThemedText style={[styles.beaconText, beaconEnabled && styles.beaconTextActive]}>Beacon</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      if (item.id === 'metrics') {
        return (
          <>
            <View style={styles.routeStats}>
              <StatBlock label='Route' value={formatDistance(routeDistanceMeters)} />
              <StatBlock label='Time' value={formatDuration(elapsedSeconds)} />
              <StatBlock label='Distance' value={formatDistance(liveDistanceMeters)} />
            </View>

            <View style={styles.recordGrid}>
              <StatBlock label='Pace' value={formatPace(liveDistanceMeters, elapsedSeconds)} />
              <StatBlock label='Elevation' value={`${selectedRoute.elevationM} m`} />
              <StatBlock label='Splits' value={liveDistanceMeters > 1000 ? '1 logged' : '--'} />
              <StatBlock label='Source' value={routeSource === 'osrm' ? 'OSRM' : 'Local'} />
            </View>
          </>
        );
      }

      return (
        <View style={styles.recordControlsNew}>
          {!isRecording ? (
            <ModernSwipeButton label='Trượt để bắt đầu ghi' onComplete={() => startRecording(recordStartMode)} />
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
              <ModernSwipeButton tone='finish' label='Trượt để kết thúc và lưu' onComplete={finishRecording} />
            </>
          )}
        </View>
      );
    },
    [
      beaconEnabled,
      closeRecordSheet,
      elapsedSeconds,
      finishRecording,
      isPaused,
      isRecording,
      liveDistanceMeters,
      pauseRecording,
      recordStartMode,
      recordingTitle,
      routeDistanceMeters,
      routeSource,
      selectedRoute.elevationM,
      startRecording,
    ],
  );

  const renderRecordBottomItem = useCallback<ListRenderItem<RecordBottomItem>>(
    ({ item }) => {
      if (item.id === 'route') {
        return (
          <View style={styles.recordRouteDetail}>
            <View style={styles.recordDetailRow}>
              <ThemedText style={styles.recordDetailLabel}>Cung đường</ThemedText>
              <ThemedText numberOfLines={1} style={styles.recordDetailValue}>
                {recordStartMode === 'route' ? selectedRoute.title : 'Record tự do'}
              </ThemedText>
            </View>
            <View style={styles.recordDetailRow}>
              <ThemedText style={styles.recordDetailLabel}>Mục tiêu</ThemedText>
              <ThemedText style={styles.recordDetailValue}>
                {recordStartMode === 'route' ? `${selectedRoute.distanceKm.toFixed(1)} km` : 'Lưu track sau khi kết thúc'}
              </ThemedText>
            </View>
            <View style={styles.recordDetailRow}>
              <ThemedText style={styles.recordDetailLabel}>Dữ liệu route</ThemedText>
              <ThemedText style={styles.recordDetailValue}>{routeSource === 'osrm' ? 'OSRM' : 'Local fallback'}</ThemedText>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.liveSplits}>
          <View style={styles.splitIcon}>
            <Timer size={18} color='#FF8A00' />
          </View>
          <View style={styles.splitBody}>
            <ThemedText style={styles.splitTitle}>Auto splits</ThemedText>
            <ThemedText style={styles.splitMeta}>Mỗi kilomet sẽ được tổng hợp trong lúc record.</ThemedText>
          </View>
        </View>
      );
    },
    [recordStartMode, routeSource, selectedRoute.distanceKm, selectedRoute.title],
  );

  const renderRecordSplitHeader = useCallback(() => <View />, []);

  const showRouteCarousel = !recordPanelVisible && !isRecording;

  return (
    <ThemedView flex backgroundColor='#101114'>
      <RouteMap
        center={center}
        routeCoordinates={routeCoordinates}
        liveCoordinates={liveCoordinates}
        waypoints={waypoints}
        heatRoutes={heatRoutes}
        segments={[]}
        showHeatmap={showHeatmap}
        showSegments={false}
        mapLayer={mapLayer}
        activityMode={activityMode}
        followUser={followUser}
        onMapPress={handleMapPress}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.searchPill}>
          <Search size={18} color='#6B7280' />
          <ThemedText numberOfLines={1} style={styles.searchText}>
            Tìm kiếm vị trí
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
          onPress={() => setFollowUser(value => !value)}>
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
          {isRouting ? 'Đang dựng cung đường...' : routeSource === 'osrm' ? 'Route by OSRM' : locationStatus}
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

            buildRoute({
              ...nearestRoute,
              source: 'generated',
            });
            setRecordPanelVisible(false);
          }}>
          <ThemedText style={styles.searchHereText}>Tìm kiếm tại đây</ThemedText>
        </TouchableOpacity>
      )}

      {showRouteCarousel && (
        <View style={[styles.routeCarouselOverlay, { bottom: insets.bottom + 88 }]}>
          <View style={styles.carouselFilterRow}>
            <View style={styles.carouselFilterPill}>
              <Flame size={15} color='#FF5A1F' />
              <ThemedText style={styles.carouselFilterText}>Lộ trình</ThemedText>
            </View>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.carouselFilterPill}
              onPress={() => {
                const nextMode = getNextActivityMode(activityMode);
                const nextRoute = createRouteSummaries(center, nextMode)[0];

                setActivityMode(nextMode);

                if (nextRoute) {
                  buildRoute({ ...nextRoute, source: 'generated' }, nextMode);
                }
              }}>
              <MapPinned size={15} color='#FFFFFF' />
              <ThemedText style={styles.carouselFilterText}>{ACTIVITY_MODE_LABELS[activityMode]}</ThemedText>
            </TouchableOpacity>
            {isRouting && <ActivityIndicator color='#FF5A1F' size='small' />}
          </View>

          <CircularCarousel
            data={carouselItems}
            itemWidth={carouselCardWidth}
            horizontalSpacing={12}
            spacing={0}
            keyExtractor={(item, index) => (item.type === 'route' ? item.route.id : `record-${index}`)}
            onIndexChange={handleRouteCarouselIndexChange}
            contentContainerStyle={styles.routeCarouselContent}
            renderItem={({ item }) =>
              item.type === 'route' ? (
                <RouteCarouselCard
                  route={item.route}
                  width={carouselCardWidth}
                  active={selectedRouteId === item.route.id}
                  onPress={() => openRouteRecordSheet(item.route)}
                />
              ) : (
                <TouchableOpacity activeOpacity={0.9} style={[styles.recordCarouselCard, { width: carouselCardWidth }]} onPress={openFreeRecordSheet}>
                  <View style={styles.recordCardIcon}>
                    <Timer size={20} color='#FF5A1F' />
                  </View>
                  <View style={styles.recordCardBody}>
                    <ThemedText numberOfLines={1} style={styles.routeCarouselTitle}>
                      Ghi lại cung đường mới
                    </ThemedText>
                    <ThemedText style={styles.routeCarouselMeta}>Tự record ngay, sau đó lưu track này để chạy lại lần sau.</ThemedText>
                  </View>
                </TouchableOpacity>
              )
            }
          />
        </View>
      )}

      {(recordPanelVisible || isRecording) && (
        <View style={styles.recordSplitOverlay}>
          <SplitView
            topSectionItems={recordTopItems}
            bottomSectionItems={recordBottomItems}
            bottomSectionTitle={isRecording ? 'Đang record' : 'Chuẩn bị'}
            initialTopSectionHeight={recordSplitInitialTopHeight}
            minSectionHeight={recordSplitMinTopHeight}
            maxTopSectionHeight={recordSplitMaxTopHeight}
            velocityThreshold={900}
            springConfig={recordSplitSpringConfig}
            containerBackgroundColor='#101114'
            sectionBackgroundColor='#FFFFFF'
            dividerBackgroundColor='#101114'
            dragHandleColor='#FF5A1F'
            renderTopItem={renderRecordTopItem}
            renderBottomItem={renderRecordBottomItem}
            renderHeader={renderRecordSplitHeader}
            topKeyExtractor={item => item.id}
            bottomKeyExtractor={item => item.id}
            showHeader={false}
            topListContentContainerStyle={styles.recordSplitTopContent}
            bottomListContentContainerStyle={styles.recordSplitBottomContent}
            sectionTitleStyle={styles.recordSplitSectionTitle}
            sectionTitleTextColor='#111111'
          />
        </View>
      )}
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

function RouteCarouselCard({ route, width, active, onPress }: { route: RouteChoice; width: number; active: boolean; onPress: () => void }) {
  return (
    <View style={[styles.routeCarouselCard, { width }, active && styles.routeCarouselCardActive]}>
      <TouchableOpacity activeOpacity={0.9} style={styles.routeCarouselTapArea} onPress={onPress}>
        <View style={styles.routeThumbnail}>
          <View style={styles.routeThumbnailSky} />
          <View style={styles.routeThumbnailWater} />
          <View style={styles.routeThumbnailRoad} />
          <View style={styles.routeThumbnailLine} />
        </View>
        <View style={styles.routeCarouselBody}>
          <View style={styles.routeCarouselTitleRow}>
            <ThemedText numberOfLines={1} style={styles.routeCarouselTitle}>
              {route.title}
            </ThemedText>
            <View style={[styles.routeCarouselBadge, route.source === 'saved' && styles.routeCarouselSavedBadge]}>
              {route.source === 'saved' ? <Download size={12} color='#5BD67D' /> : <Sparkles size={12} color='#FF8A00' />}
              <ThemedText style={[styles.routeCarouselBadgeText, route.source === 'saved' && styles.routeCarouselSavedText]}>
                {route.source === 'saved' ? 'Đã lưu' : 'Đề xuất'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.routeCarouselMetaRow}>
            <ThemedText style={styles.routeCarouselMeta}>{route.distanceKm.toFixed(1)} km</ThemedText>
            <View style={styles.routeMetaDot} />
            <ThemedText style={styles.routeCarouselMeta}>{route.elevationM} m</ThemedText>
            <View style={styles.routeMetaDot} />
            <ThemedText style={styles.routeCarouselMeta}>0 giờ {route.estimatedMinutes} phút</ThemedText>
          </View>

          <View style={styles.routeLocationRow}>
            <LocateFixed size={14} color='#C8CCD2' />
            <ThemedText numberOfLines={1} style={styles.routeLocationText}>
              Vị trí hiện tại
            </ThemedText>
          </View>

          <View style={styles.routePrivacyRow}>
            <MapPinned size={14} color='#FF5A1F' />
            <ThemedText numberOfLines={1} style={styles.routePrivacyText}>
              Được thiết kế riêng cho bạn
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
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
  routeCarouselOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  carouselFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  carouselFilterPill: {
    minHeight: 34,
    borderRadius: 8,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  carouselFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  routeCarouselContent: {
    marginTop: 0,
    marginBottom: 0,
    bottom: 0,
  },
  routeCarouselCard: {
    minHeight: 118,
    borderRadius: 8,
    backgroundColor: '#101114',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  routeCarouselCardActive: {
    borderColor: '#FF5A1F',
  },
  routeCarouselTapArea: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 98,
  },
  routeThumbnail: {
    width: 92,
    alignSelf: 'stretch',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#22262B',
  },
  routeThumbnailSky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: '#6B7B73',
  },
  routeThumbnailWater: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
    backgroundColor: '#222F3A',
  },
  routeThumbnailRoad: {
    position: 'absolute',
    left: -10,
    right: -12,
    bottom: 26,
    height: 34,
    backgroundColor: '#52625F',
    transform: [{ rotate: '-9deg' }],
  },
  routeThumbnailLine: {
    position: 'absolute',
    width: 86,
    height: 6,
    left: 9,
    top: 66,
    borderRadius: 6,
    backgroundColor: '#FF5A1F',
    transform: [{ rotate: '-18deg' }],
  },
  routeCarouselBody: {
    flex: 1,
    minWidth: 0,
  },
  routeCarouselTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  routeCarouselTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  routeCarouselBadge: {
    minHeight: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 90, 31, 0.14)',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  routeCarouselSavedBadge: {
    backgroundColor: 'rgba(54, 211, 153, 0.14)',
  },
  routeCarouselBadgeText: {
    color: '#FF8A00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  routeCarouselSavedText: {
    color: '#5BD67D',
  },
  routeCarouselMetaRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  routeCarouselMeta: {
    color: '#D8DCE2',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  routeMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF5A1F',
  },
  routeLocationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeLocationText: {
    color: '#C8CCD2',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  routePrivacyRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routePrivacyText: {
    flex: 1,
    color: '#FF5A1F',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  recordCarouselCard: {
    minHeight: 118,
    borderRadius: 8,
    backgroundColor: '#101114',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  recordCardIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 90, 31, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordCardBody: {
    flex: 1,
    minWidth: 0,
  },
  recordSplitOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    backgroundColor: '#101114',
  },
  recordSplitTopContent: {
    gap: 14,
    padding: 16,
    paddingBottom: 22,
  },
  recordSplitBottomContent: {
    gap: 12,
    padding: 16,
    paddingBottom: 34,
  },
  recordSplitSectionTitle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  recordRouteDetail: {
    borderRadius: 8,
    backgroundColor: '#F7F7F8',
    padding: 14,
    gap: 11,
  },
  recordDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  recordDetailLabel: {
    color: '#777B84',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  recordDetailValue: {
    flex: 1,
    color: '#111111',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'right',
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
  recordHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  sheetActionRow: {
    alignItems: 'flex-end',
    gap: 8,
  },
  changeRoutePill: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 8,
    backgroundColor: '#F1F2F4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeRouteText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
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
  splitBody: {
    flex: 1,
    minWidth: 0,
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
