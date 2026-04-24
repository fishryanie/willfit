import { ViewTheme } from 'components/base';
import { Layers3, LocateFixed } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { theme } from 'theme';
import { useRouteRecordStore } from '../../store/use-route-record-store';

export function RouteMapControls() {
  const mapType = useRouteRecordStore(state => state.mapType);
  const isThreeD = useRouteRecordStore(state => state.isThreeD);
  const isMapLayerSheetOpen = useRouteRecordStore(state => state.isMapLayerSheetOpen);
  const gpsVariant = useRouteRecordStore(state => state.gpsVariant);
  const isLocating = useRouteRecordStore(state => state.isLocating);
  const openMapLayerSheet = useRouteRecordStore(state => state.openMapLayerSheet);
  const handleToggle3D = useRouteRecordStore(state => state.toggleThreeD);
  const handleFocusLocation = useRouteRecordStore(state => state.resolveCurrentLocation);
  const handleGpsPress = useRouteRecordStore(state => state.resolveCurrentLocation);
  const mapTypeLabel = mapType === 'standard' ? 'Map' : mapType === 'terrain' ? 'Ter' : 'Sat';

  return (
    <>
      <ViewTheme position='absolute' right={12} bottom={332} alignItems='center' gap={theme.spacing.sm} zIndex={60} backgroundColor='transparent'>
        <Pressable style={[mapToolButton, isMapLayerSheetOpen ? mapToolButtonActive : undefined]} onPress={openMapLayerSheet}>
          <Layers3 size={20} color={theme.colors.textPrimary} />
          <View style={mapToolBadge}>
            <Text style={mapToolBadgeText}>{mapTypeLabel}</Text>
          </View>
        </Pressable>

        <Pressable style={[mapToolButton, isThreeD ? mapToolButtonActive : undefined]} onPress={handleToggle3D}>
          <Text style={[mapTool3dText, isThreeD ? mapTool3dTextActive : undefined]}>3D</Text>
        </Pressable>

        <Pressable style={mapToolButton} onPress={() => void handleFocusLocation({ forceFocus: true })}>
          <LocateFixed size={22} color={theme.colors.textPrimary} />
        </Pressable>
      </ViewTheme>

      <Pressable style={gpsButton} onPress={() => void handleGpsPress({ forceFocus: true })}>
        <Text style={gpsButtonLabel}>GPS</Text>
        <View style={gpsDotsRow}>
          {[0, 1, 2].map(index => (
            <View key={index} style={[gpsDot, gpsVariant === 'good' ? gpsDotGood : gpsDotWarning, isLocating ? gpsDotLoading : undefined]} />
          ))}
        </View>
      </Pressable>
    </>
  );
}

const mapToolButton = {
  width: 54,
  height: 54,
  borderRadius: 27,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(6,10,20,0.96)',
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.shadows.mediumShadow,
} as const;

const mapToolButtonActive = {
  borderColor: 'rgba(86,204,242,0.42)',
  backgroundColor: 'rgba(20,34,58,0.95)',
} as const;

const mapToolBadge = {
  position: 'absolute',
  right: -3,
  top: -3,
  minWidth: 22,
  height: 19,
  borderRadius: 9.5,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.12)',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 4,
} as const;

const mapToolBadgeText = {
  color: '#101828',
  fontSize: 10,
  fontWeight: '700',
  lineHeight: 12,
} as const;

const mapTool3dText = {
  color: theme.colors.textPrimary,
  fontSize: 22,
  fontWeight: '600',
  lineHeight: 24,
} as const;

const mapTool3dTextActive = {
  color: theme.colors.primary2,
} as const;

const gpsButton = {
  position: 'absolute',
  right: 12,
  bottom: 278,
  minWidth: 72,
  height: 34,
  borderRadius: theme.radius.pill,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: 'rgba(8,15,28,0.9)',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.sm,
  ...theme.shadows.softShadow,
} as const;

const gpsButtonLabel = {
  color: theme.colors.textPrimary,
  ...theme.typography.captionStrong,
} as const;

const gpsDotsRow = {
  flexDirection: 'row',
  gap: 4,
} as const;

const gpsDot = {
  width: 6,
  height: 6,
  borderRadius: 3,
} as const;

const gpsDotGood = {
  backgroundColor: theme.colors.success,
} as const;

const gpsDotWarning = {
  backgroundColor: theme.colors.warning,
} as const;

const gpsDotLoading = {
  opacity: 0.5,
} as const;
