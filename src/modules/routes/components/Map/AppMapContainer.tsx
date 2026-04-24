import { useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { theme } from 'theme';
import { DEFAULT_MAP_DELTA, ROUTE_COLORS } from '../../constants';
import { useRouteRecordStore } from '../../store/use-route-record-store';
import { MapLayerSheet } from './MapLayerSheet';
import { RouteMapControls } from './RouteMapControls';

type AppMapContainerProps = {
  children?: ReactNode;
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0A1323' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#667A98' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A1323' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#475970' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#102038' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0C1A2F' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0B2244' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#213859' }] },
] as const;

export function AppMapContainer({ children }: AppMapContainerProps) {
  const origin = useRouteRecordStore(state => state.origin);
  const phase = useRouteRecordStore(state => state.phase);
  const selectedRoute = useRouteRecordStore(state => state.selectedRoute);
  const finishedRecord = useRouteRecordStore(state => state.finishedRecord);
  const mapType = useRouteRecordStore(state => state.mapType);
  const showsTraffic = useRouteRecordStore(state => state.showsTraffic);
  const showsBuildings = useRouteRecordStore(state => state.showsBuildings);
  const isThreeD = useRouteRecordStore(state => state.isThreeD);
  const focusSignal = useRouteRecordStore(state => state.focusSignal);
  const liveCoordinates = useRouteRecordStore(state => state.liveCoordinates);
  const liveRoadCoordinates = useRouteRecordStore(state => state.liveRoadCoordinates);
  const mapRef = useRef<MapView>(null);
  const finishCoordinates = finishedRecord?.coordinates ?? [];
  const liveLastCoordinate = liveCoordinates[liveCoordinates.length - 1];
  const finishLastCoordinate = finishCoordinates[finishCoordinates.length - 1];
  const userCoordinate = phase === 'finish' ? finishLastCoordinate ?? origin : liveLastCoordinate ?? origin;
  const center = phase === 'pre' ? origin : userCoordinate;
  const routeCoordinates =
    phase === 'finish'
      ? finishCoordinates
      : phase === 'intra'
        ? liveRoadCoordinates.length > 1
          ? liveRoadCoordinates
          : liveCoordinates.length > 1
            ? liveCoordinates
            : selectedRoute?.coordinates ?? []
        : selectedRoute?.coordinates ?? [];
  const cameraPitch = isThreeD ? 62 : 0;
  const cameraHeading = isThreeD ? 32 : 0;
  const cameraZoom = isThreeD ? 18.3 : 17.8;
  const cameraAltitude = isThreeD ? 230 : 560;

  useEffect(() => {
    const targetZoom = cameraZoom ?? (cameraPitch > 0 ? 17.2 : 15.8);
    const targetAltitude = cameraAltitude ?? (cameraPitch > 0 ? 260 : 620);
    const camera = {
      center,
      pitch: cameraPitch,
      heading: cameraHeading,
      zoom: targetZoom,
      altitude: targetAltitude,
    };

    mapRef.current?.animateCamera(camera, { duration: 720 });
  }, [cameraAltitude, cameraHeading, cameraPitch, cameraZoom, center, focusSignal]);

  return (
    <View style={container}>
      <MapView
        ref={mapRef}
        style={absoluteFill}
        customMapStyle={darkMapStyle as never}
        mapType={mapType}
        initialRegion={{
          ...center,
          ...DEFAULT_MAP_DELTA,
        }}
        loadingEnabled
        pitchEnabled
        rotateEnabled
        showsBuildings={showsBuildings}
        showsCompass
        showsScale={false}
        showsTraffic={showsTraffic}
        showsMyLocationButton={false}
        showsUserLocation={false}
        toolbarEnabled={false}>
        {routeCoordinates.length > 1 ? (
          <>
            <Polyline coordinates={routeCoordinates} strokeColor='rgba(86,204,242,0.35)' strokeWidth={11} lineCap='round' lineJoin='round' />
            <Polyline coordinates={routeCoordinates} strokeColor={ROUTE_COLORS.primary} strokeWidth={5} lineCap='round' lineJoin='round' />
          </>
        ) : null}

        {userCoordinate ? (
          <Marker coordinate={userCoordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={userOuter}>
              <View style={userInner} />
            </View>
          </Marker>
        ) : null}
      </MapView>
      {phase === 'pre' ? <RouteMapControls /> : null}
      <MapLayerSheet />
      {children}
    </View>
  );
}

const absoluteFill = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;

const container = {
  flex: 1,
  backgroundColor: theme.colors.background,
} as const;

const userOuter = {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: 'rgba(47,128,237,0.28)',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const userInner = {
  width: 14,
  height: 14,
  borderRadius: 7,
  borderWidth: 2,
  borderColor: '#FFFFFF',
  backgroundColor: theme.colors.primary,
} as const;
