import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { ModernSwipeButton } from 'components/map/modern-swipe-button';
import { ThemedText, ThemedView } from 'components/base';
import { CircularCarousel } from 'components/ui/molecules/circular-carousel';
import * as Location from 'expo-location';
import { Download, Flame, Layers, LocateFixed, MapPinned, Pause, Play, RadioTower, Search, Sparkles, Timer, Waves } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appToast } from 'utils/app-toast';
import { storage } from 'utils/storage';
import { RouteMap } from 'components/map/route-map';
import { useWorkoutStore } from 'store/use-workout-store';
import { startBackgroundTracking, stopBackgroundTracking } from 'utils/location-task';
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

type RouteChoice = RouteSummary & {
  coordinates?: Coordinate[];
  savedAt?: string;
  source: 'generated' | 'saved';
};
type RouteCarouselItem = { type: 'route'; route: RouteChoice } | { type: 'record' };

const ACTIVITY_MODE_LABELS: Record<ActivityMode, string> = {
  run: 'Chạy bộ',
  walk: 'Đi bộ',
  ride: 'Đạp xe',
  hike: 'Leo núi',
};

const getNextActivityMode = (mode: ActivityMode): ActivityMode => {
  if (mode === 'run') return 'walk';
  if (mode === 'walk') return 'ride';
  return 'run';
};

export function StravaMapScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [center, setCenter] = useState<Coordinate>(DEFAULT_COORDINATE);
  const [recordPanelVisible, setRecordPanelVisible] = useState(false);
  const [activityMode, setActivityMode] = useState<ActivityMode>('run');
  const [mapLayer, setMapLayer] = useState<MapLayer>('standard');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [followUser, setFollowUser] = useState(true);
  const [beaconEnabled, setBeaconEnabled] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<RouteChoice[]>([]);
  const [recordStartMode, setRecordStartMode] = useState<'route' | 'free'>('free');
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [waypoints, setWaypoints] = useState<Coordinate[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('morning-loop');
  const [isRouting, setIsRouting] = useState(false);
  const [routeSource, setRouteSource] = useState<'osrm' | 'local'>('local');
  const [locationStatus, setLocationStatus] = useState('Finding location...');
  const [isLocationReady, setIsLocationReady] = useState(false);

  // Global Workout Store
  const {
    isRecording,
    isPaused,
    elapsedSeconds,
    liveCoordinates,
    recordingTitle,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    stopWorkout,
    tick,
  } = useWorkoutStore();

  const recordSheetRef = useRef<BottomSheetModal>(null);
  const initialRouteBuilt = useRef(false);
  const liveCoordinatesRef = useRef<Coordinate[]>([]);

  useEffect(() => {
    liveCoordinatesRef.current = liveCoordinates;
  }, [liveCoordinates]);

  const routeSuggestions = useMemo(() => createRouteSummaries(center, activityMode), [activityMode, center]);
  const routeChoices = useMemo<RouteChoice[]>(
    () => [
      ...(activityMode === 'walk' ? savedRoutes.filter(route => route.distanceKm <= 10) : savedRoutes),
      ...routeSuggestions.map(route => ({ ...route, source: 'generated' as const })),
    ],
    [activityMode, routeSuggestions, savedRoutes],
  );
  
  const heatRoutes = useMemo(() => createHeatRoutes(center), [center]);
  const carouselCardWidth = width - 24;
  const carouselItems = useMemo<RouteCarouselItem[]>(
    () => [...routeChoices.map(route => ({ type: 'route' as const, route })), { type: 'record' as const }],
    [routeChoices],
  );
  const recordSheetSnapPoints = useMemo(() => ['46%', '78%'], []);
  const routeDistanceMeters = useMemo(() => calculateTrackDistance(routeCoordinates), [routeCoordinates]);
  const liveDistanceMeters = useMemo(() => calculateTrackDistance(liveCoordinates), [liveCoordinates]);

  const selectedRoute = useMemo(
    () => routeChoices.find(route => route.id === selectedRouteId) ?? routeChoices[0] ?? { ...routeSuggestions[0], source: 'generated' as const },
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
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextCenter = { latitude: position.coords.latitude, longitude: position.coords.longitude };
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
      if (!item || item.type !== 'route' || item.route.id === selectedRouteId) return;
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
      setRecordPanelVisible(true);
      void buildRoute(route);
    },
    [buildRoute],
  );

  const openFreeRecordSheet = useCallback(() => {
    setRecordStartMode('free');
    setRouteCoordinates([]);
    setWaypoints([]);
    setRecordPanelVisible(true);
  }, []);

  const closeRecordSheet = useCallback(() => {
    if (!isRecording) setRecordPanelVisible(false);
  }, [isRecording]);

  const handleRecordSheetDismiss = useCallback(() => {
    if (!isRecording) setRecordPanelVisible(false);
  }, [isRecording]);

  const renderRecordBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={1} disappearsOnIndex={-1} opacity={0.12} pressBehavior={isRecording ? 'none' : 'close'} />
    ),
    [isRecording],
  );

  const startRecording = useCallback(
    async (mode: 'route' | 'free' = 'route') => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        appToast.error('Chưa bật vị trí', 'Cho phép GPS để bắt đầu record hoạt động.');
        return;
      }

      await Location.requestBackgroundPermissionsAsync(); // Request background optional

      const title = mode === 'free' ? 'Free run' : (selectedRoute?.title ?? 'Suggested route');
      startWorkout(title);
      setRecordStartMode(mode);
      setRecordPanelVisible(true);

      await startBackgroundTracking();
    },
    [selectedRoute, startWorkout],
  );

  const finishRecording = useCallback(async () => {
    await stopBackgroundTracking();
    
    const recordedTrack = liveCoordinatesRef.current;
    if (recordedTrack.length < 2) {
      appToast.warning('Chưa lưu được cung đường', 'GPS chưa có đủ điểm để tạo cung đường mới.');
      stopWorkout();
      setRecordPanelVisible(false);
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

    stopWorkout();
    setRecordPanelVisible(false);
    setSelectedRouteId(savedRoute.id);
    setRouteCoordinates(recordedTrack);
    setWaypoints([recordedTrack[0], recordedTrack[recordedTrack.length - 1]]);
    setRouteSource('local');
    appToast.success('Đã lưu cung đường', `${savedRoute.distanceKm.toFixed(2)} km đã được thêm vào danh sách.`);
  }, [elapsedSeconds, persistSavedRoutes, recordingTitle, savedRoutes.length, stopWorkout]);

  const togglePause = useCallback(() => {
    if (isPaused) resumeWorkout();
    else pauseWorkout();
  }, [isPaused, pauseWorkout, resumeWorkout]);

  // Sync saved routes from storage
  useEffect(() => {
    let isMounted = true;
    storage.getItem('willfit:saved-routes').then(value => {
      if (!isMounted || !value) return;
      try {
        const parsedRoutes = JSON.parse(value) as RouteChoice[];
        setSavedRoutes(parsedRoutes.filter(r => r.coordinates && r.coordinates.length > 1));
      } catch (err) {
        console.error('Failed to parse saved routes:', err);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Initial location request
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Initial route building
  useEffect(() => {
    if (!isLocationReady || initialRouteBuilt.current) return;
    const initialRoute = routeChoices[0];
    if (!initialRoute) return;
    initialRouteBuilt.current = true;
    void buildRoute(initialRoute);
  }, [buildRoute, isLocationReady, routeChoices]);

  // Timer tick
  useEffect(() => {
    if (!isRecording || isPaused) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isRecording, tick]);

  // Bottom sheet management
  useEffect(() => {
    if (recordPanelVisible || isRecording) {
      recordSheetRef.current?.present();
    } else {
      recordSheetRef.current?.dismiss();
    }
  }, [isRecording, recordPanelVisible]);

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

      <ThemedView backgroundColor='transparent' style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <ThemedView style={styles.searchPill}>
          <Search size={18} color='#6B7280' />
          <ThemedText numberOfLines={1} color='#6B7280' fontSize={14} fontWeight='600' letterSpacing={0}>
            Tìm kiếm vị trí
          </ThemedText>
        </ThemedView>
        <TouchableOpacity
          activeOpacity={0.78}
          style={styles.iconButton}
          onPress={() => setMapLayer(value => (value === 'standard' ? 'satellite' : 'standard'))}>
          <Layers size={20} color='#111111' />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView backgroundColor='transparent' style={[styles.mapControls, { top: insets.top + 74 }]}>
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
      </ThemedView>

      <ThemedView style={[styles.statusPill, { top: insets.top + 78 }]}>
        <ThemedView style={[styles.statusDot, routeSource === 'osrm' ? styles.statusDotOnline : styles.statusDotLocal]} />
        <ThemedText numberOfLines={1} color='#111111' fontSize={12} fontWeight='700' letterSpacing={0}>
          {isRouting ? 'Đang dựng cung đường...' : routeSource === 'osrm' ? 'Route by OSRM' : locationStatus}
        </ThemedText>
      </ThemedView>

      {!isRecording && (
        <TouchableOpacity
          activeOpacity={0.86}
          style={[styles.searchHereButton, { top: insets.top + 126 }]}
          onPress={() => {
            const nearestRoute = routeSuggestions[0];
            if (!nearestRoute) return;
            buildRoute({ ...nearestRoute, source: 'generated' });
            setRecordPanelVisible(false);
          }}>
          <ThemedText color='#FFFFFF' fontSize={14} fontWeight='900' letterSpacing={0}>
            Tìm kiếm tại đây
          </ThemedText>
        </TouchableOpacity>
      )}

      {showRouteCarousel && (
        <ThemedView backgroundColor='transparent' style={[styles.routeCarouselOverlay, { bottom: insets.bottom + 88 }]}>
          <ThemedView backgroundColor='transparent' style={styles.carouselFilterRow}>
            <ThemedView style={styles.carouselFilterPill}>
              <Flame size={15} color='#FF5A1F' />
              <ThemedText color='#FFFFFF' fontSize={12} fontWeight='900' letterSpacing={0}>
                Lộ trình
              </ThemedText>
            </ThemedView>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.carouselFilterPill}
              onPress={() => {
                const nextMode = getNextActivityMode(activityMode);
                const nextRoute = createRouteSummaries(center, nextMode)[0];
                setActivityMode(nextMode);
                if (nextRoute) buildRoute({ ...nextRoute, source: 'generated' }, nextMode);
              }}>
              <MapPinned size={15} color='#FFFFFF' />
              <ThemedText color='#FFFFFF' fontSize={12} fontWeight='900' letterSpacing={0}>
                {ACTIVITY_MODE_LABELS[activityMode]}
              </ThemedText>
            </TouchableOpacity>
            {isRouting && <ActivityIndicator color='#FF5A1F' size='small' />}
          </ThemedView>

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
                  <ThemedView style={styles.recordCardIcon}>
                    <Timer size={20} color='#FF5A1F' />
                  </ThemedView>
                  <ThemedView backgroundColor='transparent' style={styles.recordCardBody}>
                    <ThemedText flex numberOfLines={1} color='#FFFFFF' fontSize={15} fontWeight='900' letterSpacing={0}>
                      Ghi lại cung đường mới
                    </ThemedText>
                    <ThemedText color='#D8DCE2' fontSize={12} fontWeight='800' letterSpacing={0}>
                      Tự record ngay, sau đó lưu track này để chạy lại lần sau.
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              )
            }
          />
        </ThemedView>
      )}

      <BottomSheetModal
        ref={recordSheetRef}
        index={0}
        snapPoints={recordSheetSnapPoints}
        backdropComponent={renderRecordBackdrop}
        enablePanDownToClose={!isRecording}
        backgroundStyle={styles.recordSheetBackground}
        handleIndicatorStyle={styles.recordSheetHandle}
        onDismiss={handleRecordSheetDismiss}>
        <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.recordSheetContent, { paddingBottom: insets.bottom + 28 }]}>
          <ThemedView row alignItems='flex-start' justifyContent='space-between' gap={12} backgroundColor='transparent' marginBottom={16}>
            <ThemedView flex minWidth={0} backgroundColor='transparent'>
              <ThemedText color='#111111' fontSize={22} lineHeight={28} fontWeight='900' letterSpacing={0}>
                {isRecording ? recordingTitle : recordStartMode === 'route' ? recordingTitle : 'Record activity'}
              </ThemedText>
              <ThemedText color='#737780' fontSize={13} lineHeight={18} letterSpacing={0} marginTop={3}>
                {isRecording ? 'Vuốt để kết thúc và lưu lại cung đường.' : 'Vuốt để bắt đầu record.'}
              </ThemedText>
            </ThemedView>

            <ThemedView alignItems='flex-end' gap={8} backgroundColor='transparent'>
              {!isRecording && (
                <TouchableOpacity activeOpacity={0.82} style={styles.changeRoutePill} onPress={closeRecordSheet}>
                  <Search size={14} color='#111111' />
                  <ThemedText color='#111111' fontSize={12} fontWeight='900' letterSpacing={0}>
                    Đổi cung
                  </ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.82}
                style={[styles.beaconPill, beaconEnabled && styles.beaconPillActive]}
                onPress={() => setBeaconEnabled(value => !value)}>
                <RadioTower size={15} color={beaconEnabled ? '#FFFFFF' : '#111111'} />
                <ThemedText color={beaconEnabled ? '#FFFFFF' : '#111111'} fontSize={12} fontWeight='900' letterSpacing={0}>
                  Beacon
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedView row gap={10} backgroundColor='transparent' marginBottom={10}>
            <StatBlock label='Route' value={formatDistance(routeDistanceMeters)} />
            <StatBlock label='Time' value={formatDuration(elapsedSeconds)} />
            <StatBlock label='Distance' value={formatDistance(liveDistanceMeters)} />
          </ThemedView>

          <ThemedView row wrap gap={10} backgroundColor='transparent'>
            <StatBlock label='Pace' value={formatPace(liveDistanceMeters, elapsedSeconds)} compact />
            <StatBlock label='Elevation' value={`${selectedRoute.elevationM} m`} compact />
            <StatBlock label='Splits' value={liveDistanceMeters > 1000 ? '1 logged' : '--'} compact />
            <StatBlock label='Source' value={routeSource === 'osrm' ? 'OSRM' : 'Local'} compact />
          </ThemedView>

          <ThemedView gap={16} backgroundColor='transparent' marginTop={22}>
            {!isRecording ? (
              <ModernSwipeButton label='Trượt để bắt đầu ghi' onComplete={() => startRecording(recordStartMode)} />
            ) : (
              <>
                <ThemedView row justifyContent='center' backgroundColor='transparent'>
                  <TouchableOpacity activeOpacity={0.88} style={styles.pauseButtonNew} onPress={togglePause}>
                    <ThemedView square={32} radius={16} backgroundColor='#FFFFFF' contentCenter style={styles.pauseIconShadow}>
                      {isPaused ? <Play size={20} color='#111111' fill='#111111' /> : <Pause size={20} color='#111111' fill='#111111' />}
                    </ThemedView>
                    <ThemedText color='#111111' fontSize={14} fontWeight='800'>
                      {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
                <ModernSwipeButton tone='finish' label='Trượt để kết thúc và lưu' onComplete={finishRecording} />
              </>
            )}
          </ThemedView>

          <ThemedView marginTop={22} gap={12} backgroundColor='transparent'>
            <ThemedText color='#111111' fontSize={17} fontWeight='900' letterSpacing={0}>
              {isRecording ? 'Đang record' : 'Chuẩn bị'}
            </ThemedText>

            <ThemedView radius={8} backgroundColor='#F7F7F8' padding={14} gap={11}>
              <RecordDetailRow label='Cung đường' value={recordStartMode === 'route' ? selectedRoute.title : 'Record tự do'} />
              <RecordDetailRow
                label='Mục tiêu'
                value={recordStartMode === 'route' ? `${selectedRoute.distanceKm.toFixed(1)} km` : 'Lưu track sau khi kết thúc'}
              />
              <RecordDetailRow label='Dữ liệu route' value={routeSource === 'osrm' ? 'OSRM' : 'Local fallback'} />
            </ThemedView>

            <ThemedView row gap={12} alignItems='center' radius={8} padding={13} backgroundColor='#F7F7F8'>
              <ThemedView square={38} radius={8} backgroundColor='#FFFFFF' contentCenter>
                <Timer size={18} color='#FF8A00' />
              </ThemedView>
              <ThemedView flex minWidth={0} backgroundColor='transparent'>
                <ThemedText color='#111111' fontWeight='900' fontSize={14} letterSpacing={0}>
                  Auto splits
                </ThemedText>
                <ThemedText color='#737780' fontSize={12} fontWeight='700' marginTop={2} letterSpacing={0}>
                  Mỗi kilomet sẽ được tổng hợp trong lúc record.
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </ThemedView>
  );
}

function StatBlock({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <ThemedView flex={compact ? undefined : 1} width={compact ? '48%' : undefined} radius={8} padding={12} backgroundColor='#F7F7F8'>
      <ThemedText color='#111111' fontSize={compact ? 16 : 18} fontWeight='900' letterSpacing={0}>
        {value}
      </ThemedText>
      <ThemedText color='#777B84' fontSize={12} fontWeight='700' letterSpacing={0} marginTop={3}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function RecordDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView row alignItems='center' justifyContent='space-between' gap={14} backgroundColor='transparent'>
      <ThemedText color='#777B84' fontSize={12} fontWeight='800' letterSpacing={0}>
        {label}
      </ThemedText>
      <ThemedText flex numberOfLines={1} textAlign='right' color='#111111' fontSize={13} fontWeight='900' letterSpacing={0}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

function RouteCarouselCard({ route, width, active, onPress }: { route: RouteChoice; width: number; active: boolean; onPress: () => void }) {
  return (
    <ThemedView style={[styles.routeCarouselCard, { width }, active && styles.routeCarouselCardActive]}>
      <TouchableOpacity activeOpacity={0.9} style={styles.routeCarouselTapArea} onPress={onPress}>
        <ThemedView style={styles.routeThumbnail}>
          <ThemedView style={styles.routeThumbnailSky} />
          <ThemedView style={styles.routeThumbnailWater} />
          <ThemedView style={styles.routeThumbnailRoad} />
          <ThemedView style={styles.routeThumbnailLine} />
        </ThemedView>
        <ThemedView backgroundColor='transparent' style={styles.routeCarouselBody}>
          <ThemedView backgroundColor='transparent' style={styles.routeCarouselTitleRow}>
            <ThemedText flex numberOfLines={1} color='#FFFFFF' fontSize={15} fontWeight='900' letterSpacing={0}>
              {route.title}
            </ThemedText>
            <ThemedView style={[styles.routeCarouselBadge, route.source === 'saved' && styles.routeCarouselSavedBadge]}>
              {route.source === 'saved' ? <Download size={12} color='#5BD67D' /> : <Sparkles size={12} color='#FF8A00' />}
              <ThemedText color={route.source === 'saved' ? '#5BD67D' : '#FF8A00'} fontSize={11} fontWeight='900' letterSpacing={0}>
                {route.source === 'saved' ? 'Đã lưu' : 'Đề xuất'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView backgroundColor='transparent' style={styles.routeCarouselMetaRow}>
            <ThemedText color='#D8DCE2' fontSize={12} fontWeight='800' letterSpacing={0}>
              {route.distanceKm.toFixed(1)} km
            </ThemedText>
            <ThemedView style={styles.routeMetaDot} />
            <ThemedText color='#D8DCE2' fontSize={12} fontWeight='800' letterSpacing={0}>
              {route.elevationM} m
            </ThemedText>
            <ThemedView style={styles.routeMetaDot} />
            <ThemedText color='#D8DCE2' fontSize={12} fontWeight='800' letterSpacing={0}>
              0 giờ {route.estimatedMinutes} phút
            </ThemedText>
          </ThemedView>

          <ThemedView backgroundColor='transparent' style={styles.routeLocationRow}>
            <LocateFixed size={14} color='#C8CCD2' />
            <ThemedText numberOfLines={1} color='#C8CCD2' fontSize={12} fontWeight='800' letterSpacing={0}>
              Vị trí hiện tại
            </ThemedText>
          </ThemedView>

          <ThemedView backgroundColor='transparent' style={styles.routePrivacyRow}>
            <MapPinned size={14} color='#FF5A1F' />
            <ThemedText flex numberOfLines={1} color='#FF5A1F' fontSize={12} fontWeight='900' letterSpacing={0}>
              Được thiết kế riêng cho bạn
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  searchPill: { flex: 1, minHeight: 46, borderRadius: 8, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 14, elevation: 5 },
  iconButton: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  mapControls: { position: 'absolute', right: 14, gap: 10 },
  floatingButton: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  floatingButtonActive: { backgroundColor: '#FF8A00' },
  beaconActive: { backgroundColor: '#FF3B30' },
  statusPill: { position: 'absolute', left: 14, minHeight: 34, paddingHorizontal: 12, borderRadius: 17, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 3 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotLocal: { backgroundColor: '#FFB800' },
  statusDotOnline: { backgroundColor: '#34C759' },
  searchHereButton: { position: 'absolute', left: '50%', transform: [{ translateX: -70 }], minWidth: 140, height: 38, borderRadius: 19, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 6 },
  routeCarouselOverlay: { position: 'absolute', left: 0, right: 0 },
  carouselFilterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, marginBottom: 12 },
  carouselFilterPill: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeCarouselContent: { paddingHorizontal: 12 },
  recordCarouselCard: { height: 110, borderRadius: 8, backgroundColor: '#111111', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  recordCardIcon: { width: 48, height: 48, borderRadius: 8, backgroundColor: 'rgba(255,90,31,0.15)', alignItems: 'center', justifyContent: 'center' },
  recordCardBody: { flex: 1, gap: 4 },
  recordSheetBackground: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  recordSheetHandle: { backgroundColor: '#E5E7EB', width: 40 },
  recordSheetContent: { paddingHorizontal: 20, paddingTop: 6 },
  changeRoutePill: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 6 },
  beaconPill: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 6 },
  beaconPillActive: { backgroundColor: '#FF3B30' },
  pauseButtonNew: { alignItems: 'center', gap: 8 },
  pauseIconShadow: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
  routeCarouselCard: { height: 160, borderRadius: 8, backgroundColor: '#111111', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  routeCarouselCardActive: { borderColor: '#FF5A1F', borderWidth: 2 },
  routeCarouselTapArea: { flex: 1, flexDirection: 'row' },
  routeThumbnail: { width: 110, height: '100%', backgroundColor: '#1A1C1E', overflow: 'hidden' },
  routeThumbnailSky: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%', backgroundColor: '#24292E' },
  routeThumbnailWater: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: '#1D242B' },
  routeThumbnailRoad: { position: 'absolute', top: '35%', left: '-10%', width: '120%', height: '40%', backgroundColor: '#2D3339', transform: [{ rotate: '-15deg' }] },
  routeThumbnailLine: { position: 'absolute', top: '50%', left: '10%', right: '10%', height: 4, backgroundColor: '#FF5A1F', borderRadius: 2, transform: [{ rotate: '-5deg' }] },
  routeCarouselBody: { flex: 1, padding: 14, gap: 10 },
  routeCarouselTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  routeCarouselBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: 'rgba(255,138,0,0.12)' },
  routeCarouselSavedBadge: { backgroundColor: 'rgba(91,214,125,0.12)' },
  routeCarouselMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeMetaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#4B5563' },
  routeLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routePrivacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 'auto' },
});
