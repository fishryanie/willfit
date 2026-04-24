import { Building2, CarFront, Check, Map as MapIcon, Mountain, Satellite, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import type { MapType } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from 'theme';
import { useRouteRecordStore } from '../../store/use-route-record-store';

const MAP_TYPE_OPTIONS: { label: string; value: MapType; icon: 'map' | 'satellite' | 'terrain' }[] = [
  { label: 'Mặc định', value: 'standard', icon: 'map' },
  { label: 'Vệ tinh', value: 'satellite', icon: 'satellite' },
  { label: 'Địa hình', value: 'terrain', icon: 'terrain' },
];

export function MapLayerSheet() {
  const insets = useSafeAreaInsets();
  const isMapLayerSheetOpen = useRouteRecordStore(state => state.isMapLayerSheetOpen);
  const mapType = useRouteRecordStore(state => state.mapType);
  const showsTraffic = useRouteRecordStore(state => state.showsTraffic);
  const showsBuildings = useRouteRecordStore(state => state.showsBuildings);
  const closeMapLayerSheet = useRouteRecordStore(state => state.closeMapLayerSheet);
  const setMapType = useRouteRecordStore(state => state.setMapType);
  const handleToggleTraffic = useRouteRecordStore(state => state.toggleTraffic);
  const handleToggleBuildings = useRouteRecordStore(state => state.toggleBuildings);

  return (
    <Modal visible={isMapLayerSheetOpen} transparent animationType='slide' statusBarTranslucent onRequestClose={closeMapLayerSheet}>
      <View style={modalRoot}>
        <Pressable style={modalBackdrop} onPress={closeMapLayerSheet} />

        <View style={[sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) + 14 }]}>
          <View style={sheetHeader}>
            <Text style={sheetTitle}>Loại bản đồ</Text>
            <Pressable accessibilityRole='button' accessibilityLabel='Đóng chọn loại bản đồ' hitSlop={10} onPress={closeMapLayerSheet} style={closeButton}>
              <X size={24} color='#6B7280' strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={mapTypeGrid}>
            {MAP_TYPE_OPTIONS.map(option => (
              <LayerOption
                key={option.value}
                label={option.label}
                active={mapType === option.value}
                icon={<MapTypePreview type={option.icon} active={mapType === option.value} />}
                onPress={() => setMapType(option.value)}
              />
            ))}
          </View>

          <View style={sheetDivider} />

          <Text style={sectionTitle}>Chi tiết bản đồ</Text>
          <View style={detailGrid}>
            <LayerOption
              columns={2}
              label='Giao thông'
              active={showsTraffic}
              icon={<DetailPreview active={showsTraffic} tone='traffic' />}
              onPress={handleToggleTraffic}
            />
            <LayerOption
              columns={2}
              label='Tòa nhà nổi khối'
              active={showsBuildings}
              icon={<DetailPreview active={showsBuildings} tone='buildings' />}
              onPress={handleToggleBuildings}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function LayerOption({
  label,
  active,
  icon,
  onPress,
  columns = 3,
}: {
  label: string;
  active: boolean;
  icon: ReactNode;
  onPress: () => void;
  columns?: 2 | 3;
}) {
  return (
    <Pressable style={[layerOption, columns === 2 ? layerOptionHalf : layerOptionThird]} onPress={onPress}>
      <View style={[previewFrame, active ? previewFrameActive : undefined]}>
        {icon}
        {active ? (
          <View style={selectedBadge}>
            <Check size={12} color='#FFFFFF' strokeWidth={3} />
          </View>
        ) : null}
      </View>
      <Text style={[layerLabel, active ? layerLabelActive : undefined]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

function MapTypePreview({ type, active }: { type: 'map' | 'satellite' | 'terrain'; active: boolean }) {
  const iconColor = active ? theme.colors.primary : '#4B5563';

  return (
    <View style={[previewSurface, type === 'satellite' ? previewSatellite : type === 'terrain' ? previewTerrain : previewDefault]}>
      <View style={previewRoadOne} />
      <View style={previewRoadTwo} />
      {type === 'map' ? <MapIcon size={24} color={iconColor} /> : null}
      {type === 'satellite' ? <Satellite size={24} color={iconColor} /> : null}
      {type === 'terrain' ? <Mountain size={25} color={iconColor} /> : null}
    </View>
  );
}

function DetailPreview({ tone, active }: { tone: 'traffic' | 'buildings'; active: boolean }) {
  const color = active ? theme.colors.primary : '#64748B';

  return (
    <View style={[previewSurface, previewDefault]}>
      <View style={previewRoadOne} />
      <View style={previewRoadTwo} />
      {tone === 'traffic' ? <CarFront size={25} color={color} /> : <Building2 size={26} color={color} />}
    </View>
  );
}

const modalRoot = {
  flex: 1,
  justifyContent: 'flex-end',
} as const;

const modalBackdrop = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(0,0,0,0.38)',
} as const;

const sheetContainer = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  backgroundColor: '#FFFFFF',
  paddingTop: 22,
  paddingHorizontal: 20,
  shadowColor: '#000',
  shadowOpacity: 0.18,
  shadowOffset: { width: 0, height: -8 },
  shadowRadius: 24,
  elevation: 20,
} as const;

const sheetHeader = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 18,
} as const;

const sheetTitle = {
  color: '#111827',
  fontSize: 22,
  lineHeight: 28,
  fontWeight: '800',
} as const;

const closeButton = {
  width: 38,
  height: 38,
  borderRadius: 19,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const mapTypeGrid = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
} as const;

const detailGrid = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 14,
} as const;

const sheetDivider = {
  height: 1,
  marginHorizontal: -20,
  marginTop: 24,
  marginBottom: 22,
  backgroundColor: '#E5E7EB',
} as const;

const sectionTitle = {
  color: '#111827',
  fontSize: 20,
  lineHeight: 26,
  fontWeight: '800',
  marginBottom: 16,
} as const;

const layerOption = {
  alignItems: 'center',
  gap: 8,
} as const;

const layerOptionThird = {
  flex: 1,
} as const;

const layerOptionHalf = {
  width: '47%',
} as const;

const previewFrame = {
  width: 72,
  height: 72,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: 'transparent',
  padding: 4,
  backgroundColor: '#F3F4F6',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const previewFrameActive = {
  borderColor: theme.colors.primary,
} as const;

const previewSurface = {
  flex: 1,
  alignSelf: 'stretch',
  borderRadius: 15,
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const previewDefault = {
  backgroundColor: '#DDF5EF',
} as const;

const previewSatellite = {
  backgroundColor: '#B7BEC5',
} as const;

const previewTerrain = {
  backgroundColor: '#D7DED3',
} as const;

const previewRoadOne = {
  position: 'absolute',
  width: 96,
  height: 11,
  borderRadius: 8,
  backgroundColor: 'rgba(255,255,255,0.78)',
  transform: [{ rotate: '-33deg' }],
} as const;

const previewRoadTwo = {
  position: 'absolute',
  width: 82,
  height: 8,
  borderRadius: 6,
  backgroundColor: 'rgba(80,105,132,0.32)',
  transform: [{ rotate: '34deg' }],
} as const;

const selectedBadge = {
  position: 'absolute',
  right: -5,
  top: -5,
  width: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: theme.colors.primary,
  borderWidth: 2,
  borderColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const layerLabel = {
  color: '#111827',
  fontSize: 13,
  lineHeight: 17,
  fontWeight: '700',
  textAlign: 'center',
} as const;

const layerLabelActive = {
  color: theme.colors.primary,
} as const;
