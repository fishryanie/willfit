import { ViewTheme } from 'components/base';
import { RotateCarousel } from 'components/ui/molecules/rotate-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, Clock3, Play } from 'lucide-react-native';
import { useEffect, useMemo, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { theme } from 'theme';
import { useRouteRecordStore } from '../../store/use-route-record-store';
import type { SuggestedWalkingRoute } from '../../types/suggested-route';
import { ITEM_HEIGHT, ITEM_WIDTH, LIST_BOTTOM_OFFSET } from './constants';

const ROUTE_SUGGESTION_COUNT = 10;

const formatPace = (minutesPerKm: number) => {
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}/km`;
};

export function RouteSuggestionsCarousel() {
  const origin = useRouteRecordStore(state => state.origin);
  const phase = useRouteRecordStore(state => state.phase);
  const suggestions = useRouteRecordStore(state => state.suggestions);
  const isLoadingSuggestions = useRouteRecordStore(state => state.isLoadingSuggestions);
  const suggestionError = useRouteRecordStore(state => state.suggestionError);
  const selectedRoute = useRouteRecordStore(state => state.selectedRoute);
  const loadSuggestedRoutes = useRouteRecordStore(state => state.loadSuggestedRoutes);
  const setSelectedRoute = useRouteRecordStore(state => state.setSelectedRoute);
  const startRoute = useRouteRecordStore(state => state.startRoute);
  const { latitude: originLatitude, longitude: originLongitude } = origin;

  useEffect(() => {
    if (phase !== 'pre') {
      return;
    }

    const controller = new AbortController();
    const nextOrigin = { latitude: originLatitude, longitude: originLongitude };

    void loadSuggestedRoutes(nextOrigin, { count: ROUTE_SUGGESTION_COUNT, signal: controller.signal });

    return () => controller.abort();
  }, [loadSuggestedRoutes, originLatitude, originLongitude, phase]);

  if (suggestions.length === 0) {
    return (
      <ViewTheme position='absolute' left={0} right={0} bottom={LIST_BOTTOM_OFFSET} height={ITEM_HEIGHT} backgroundColor='transparent'>
        <SuggestionStatusCard loading={isLoadingSuggestions} message={suggestionError} />
      </ViewTheme>
    );
  }

  return (
    <ViewTheme position='absolute' left={0} right={0} bottom={LIST_BOTTOM_OFFSET} height={ITEM_HEIGHT} backgroundColor='transparent'>
      <RotateCarousel
        data={suggestions}
        itemWidth={ITEM_WIDTH}
        spacing={0}
        horizontalSpacing={12}
        rotatePercentage={32}
        onIndexChange={index => {
          const activeRoute = suggestions[index];
          if (activeRoute) {
            setSelectedRoute(activeRoute);
          }
        }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isActive = item.id === selectedRoute?.id;
          const estimatedPace = formatPace(item.estimatedDurationMin / Math.max(0.1, item.distanceKm));
          const chipLabel = item.source === 'recorded' ? 'Đã lưu' : item.difficulty;
          const hintLabel =
            item.source === 'recorded' ? 'Lộ trình đã lưu' : item.provider === 'goong' ? 'Theo đường thật từ Goong' : 'Theo đường thật từ OpenStreetMap';

          return (
            <Pressable style={routeCardPressable} onPress={() => setSelectedRoute(item)}>
              <LinearGradient
                colors={isActive ? ['rgba(86,204,242,0.34)', 'rgba(47,128,237,0.16)'] : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
                style={routeCardFrame}>
                <View style={[routeCardSurface, isActive ? routeCardSurfaceActive : undefined]}>
                  <View style={contentRow}>
                    <MiniRoutePreview coordinates={item.coordinates} active={isActive} />

                    <View style={copyColumn}>
                      <View style={headerRow}>
                        <Text style={routeName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={[chip, item.source === 'recorded' ? chipSaved : isActive ? chipActive : undefined]}>
                          <Text style={chipLabelStyle} numberOfLines={1}>
                            {chipLabel}
                          </Text>
                        </View>
                      </View>

                      <Text style={routeMeta} numberOfLines={1}>
                        {item.distanceKm.toFixed(2)} km · {estimatedPace}
                      </Text>

                      <View style={metricsRow}>
                        <InfoPill icon={<Clock3 size={12} color='rgba(255,255,255,0.72)' />} label={`${item.estimatedDurationMin} phút`} />
                        <InfoPill icon={<ArrowUp size={12} color='rgba(255,255,255,0.72)' />} label={`${item.estimatedElevationGain} m`} />
                      </View>

                      <Text style={routeHint} numberOfLines={1}>
                        {hintLabel}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole='button'
                      accessibilityLabel={`Bắt đầu ${item.name}`}
                      hitSlop={8}
                      style={[playStartButton, isActive ? playStartButtonActive : undefined]}
                      onPress={event => {
                        event.stopPropagation();
                        void startRoute(item);
                      }}>
                      <Play size={16} color={theme.colors.textPrimary} fill={theme.colors.textPrimary} />
                    </Pressable>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          );
        }}
      />
    </ViewTheme>
  );
}

function SuggestionStatusCard({ loading, message }: { loading: boolean; message: string | null }) {
  return (
    <View style={statusCardWrap}>
      <LinearGradient colors={['rgba(86,204,242,0.2)', 'rgba(47,128,237,0.08)']} style={statusCardFrame}>
        <View style={statusCardSurface}>
          {loading ? <ActivityIndicator color={theme.colors.primary2} /> : null}
          <Text style={statusTitle} numberOfLines={1}>
            {loading ? 'Đang tìm tuyến đi bộ' : 'Chưa có tuyến phù hợp'}
          </Text>
          <Text style={statusMessage} numberOfLines={2}>
            {message ?? 'WillFit sẽ chỉ hiện lộ trình khi tìm được đường thật gần vị trí của bạn.'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View style={infoPill}>
      {icon}
      <Text style={infoPillLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function MiniRoutePreview({ coordinates, active }: { coordinates: SuggestedWalkingRoute['coordinates']; active: boolean }) {
  const points = useMemo(() => {
    if (coordinates.length < 2) {
      return '';
    }

    const width = 104;
    const height = 74;
    const inset = 10;

    const latitudes = coordinates.map(item => item.latitude);
    const longitudes = coordinates.map(item => item.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return coordinates
      .map(point => {
        const x = ((point.longitude - minLng) / (maxLng - minLng || 1)) * (width - inset * 2) + inset;
        const y = (1 - (point.latitude - minLat) / (maxLat - minLat || 1)) * (height - inset * 2) + inset;
        return `${x},${y}`;
      })
      .join(' ');
  }, [coordinates]);

  return (
    <View style={[previewCard, active ? previewCardActive : undefined]}>
      <LinearGradient colors={['rgba(7,16,31,0.96)', 'rgba(9,18,34,0.92)']} style={previewGradient}>
        {points ? (
          <Svg width='100%' height='100%' viewBox='0 0 104 74'>
            <Polyline
              points={points}
              fill='none'
              stroke={active ? '#56CCF2' : 'rgba(95,171,255,0.88)'}
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </Svg>
        ) : (
          <View style={previewFallback} />
        )}
      </LinearGradient>
    </View>
  );
}

const routeCardPressable = {
  width: ITEM_WIDTH,
  height: ITEM_HEIGHT,
} as const;

const statusCardWrap = {
  width: ITEM_WIDTH,
  height: ITEM_HEIGHT,
  alignSelf: 'center',
} as const;

const statusCardFrame = {
  flex: 1,
  borderRadius: theme.radius.lg,
  padding: 1,
} as const;

const statusCardSurface = {
  flex: 1,
  borderRadius: theme.radius.lg - 1,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(8,14,28,0.94)',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
  gap: 8,
  ...theme.shadows.softShadow,
} as const;

const statusTitle = {
  color: theme.colors.textPrimary,
  fontSize: 15,
  lineHeight: 19,
  fontWeight: '800',
} as const;

const statusMessage = {
  color: theme.colors.textSecondary,
  fontSize: 12,
  lineHeight: 17,
  fontWeight: '600',
  textAlign: 'center',
} as const;

const routeCardFrame = {
  flex: 1,
  borderRadius: theme.radius.lg,
  padding: 1,
} as const;

const routeCardSurface = {
  flex: 1,
  borderRadius: theme.radius.lg - 1,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(8,14,28,0.92)',
  paddingHorizontal: 10,
  paddingVertical: 10,
  ...theme.shadows.softShadow,
} as const;

const routeCardSurfaceActive = {
  borderColor: 'rgba(86,204,242,0.3)',
  backgroundColor: 'rgba(9,18,34,0.96)',
} as const;

const contentRow = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
} as const;

const copyColumn = {
  flex: 1,
  minWidth: 0,
} as const;

const headerRow = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
} as const;

const routeName = {
  flex: 1,
  color: theme.colors.textPrimary,
  fontSize: 15,
  lineHeight: 19,
  fontWeight: '700',
} as const;

const chip = {
  maxWidth: 64,
  height: 20,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.14)',
  backgroundColor: 'rgba(255,255,255,0.08)',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8,
} as const;

const chipActive = {
  borderColor: 'rgba(86,204,242,0.38)',
  backgroundColor: 'rgba(47,128,237,0.14)',
} as const;

const chipSaved = {
  borderColor: 'rgba(47,128,237,0.42)',
  backgroundColor: 'rgba(47,128,237,0.2)',
} as const;

const chipLabelStyle = {
  color: theme.colors.textSecondary,
  fontSize: 10,
  lineHeight: 13,
  fontWeight: '700',
} as const;

const routeMeta = {
  color: theme.colors.textSecondary,
  fontSize: 11,
  lineHeight: 15,
  fontWeight: '600',
  marginTop: 4,
} as const;

const metricsRow = {
  flexDirection: 'row',
  gap: 6,
  marginTop: 7,
} as const;

const infoPill = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(255,255,255,0.05)',
  paddingHorizontal: 7,
  paddingVertical: 4,
} as const;

const infoPillLabel = {
  color: 'rgba(255,255,255,0.74)',
  fontSize: 10,
  lineHeight: 13,
  fontWeight: '700',
} as const;

const routeHint = {
  color: theme.colors.textMuted,
  fontSize: 10,
  lineHeight: 13,
  fontWeight: '500',
  marginTop: 7,
} as const;

const previewCard = {
  width: 78,
  height: 92,
  borderRadius: 16,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(5,11,24,0.9)',
} as const;

const previewCardActive = {
  borderColor: 'rgba(86,204,242,0.24)',
} as const;

const previewGradient = {
  flex: 1,
  padding: 7,
} as const;

const previewFallback = {
  flex: 1,
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.05)',
} as const;

const playStartButton = {
  width: 34,
  height: 34,
  borderRadius: 17,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.22)',
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: theme.colors.primary,
  shadowOpacity: 0.34,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 12,
  elevation: 6,
} as const;

const playStartButtonActive = {
  borderColor: 'rgba(255,255,255,0.36)',
  backgroundColor: theme.colors.primary,
} as const;
